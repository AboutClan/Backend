import { JWT } from "next-auth/jwt";
import { IRegistered, Registered } from "../db/models/registered";
import { User } from "../db/models/user";
import * as CryptoJS from "crypto-js";
import LogService from "./logService";
import dbConnect from "../db/conn";

const logger = require("../../logger");

export default class RegisterService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async encodeByAES56(tel: string) {
    const key = process.env.cryptoKey;
    if (!key) return tel;

    return CryptoJS.AES.encrypt(tel, key).toString();
  }

  async decodeByAES256(encodedTel: string) {
    try {
      const key = process.env.cryptoKey;
      if (!key) return encodedTel;

      const bytes = CryptoJS.AES.decrypt(encodedTel, key);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (err) {
      throw new Error();
    }
  }

  async register(subRegisterForm: Omit<IRegistered, "uid" | "profileImage">) {
    const { telephone } = subRegisterForm;
    const encodedTel = await this.encodeByAES56(telephone);
    if (encodedTel === telephone) throw new Error("Key not exist");
    if (encodedTel.length == 0) throw new Error("Key not exist");

    const registerForm = {
      uid: this.token.uid,
      profileImage: this.token.picture,
      ...subRegisterForm,
      telephone: encodedTel,
    };

    try {
      await Registered.findOneAndUpdate({ uid: this.token.uid }, registerForm, {
        upsert: true,
        new: true,
      });

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async approve(uid: string) {
    let userForm;

    try {
      const user = await Registered.findOne({ uid }, "-_id -__v");
      if (!user) return;

      userForm = {
        ...user.toObject(),
        role: "human",
        registerDate: new Date(),
        isActive: true,
        deposit: 3000,
      };
    } catch (err: any) {
      throw new Error(err);
    }

    const db = await dbConnect();
    const session = await db.startSession();

    try {
      session.startTransaction();

      await User.findOneAndUpdate({ uid }, userForm, {
        upsert: true,
        new: true,
      }).session(session);

      await this.deleteRegisterUser(uid, session);

      await session.commitTransaction();
      session.endSession();
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(err);
    }

    logger.logger.info("가입 보증금", {
      metadata: { type: "deposit", uid, value: 3000 },
    });
    return;
  }

  async deleteRegisterUser(uid: string, session: any) {
    try {
      if (session) {
        await Registered.deleteOne({ uid }).session(session);
      } else {
        await Registered.deleteOne({ uid });
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getRegister() {
    try {
      const users = await Registered.find({});

      users.forEach(async (user) => {
        user.telephone = await this.decodeByAES256(user.telephone);
      });

      return users;
    } catch (err) {
      throw new Error();
    }
  }
}
