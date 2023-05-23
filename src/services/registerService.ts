import { JWT } from "next-auth/jwt";
import { IRegistered, Registered } from "../db/models/registered";
import { User } from "../db/models/user";
import * as CryptoJS from "crypto-js";

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
    const key = process.env.cryptoKey;
    if (!key) return encodedTel;

    const bytes = CryptoJS.AES.decrypt(encodedTel, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }

  async register(subRegisterForm: Omit<IRegistered, "uid" | "profileImage">) {
    const { telephone } = subRegisterForm;
    const encodedTel = await this.encodeByAES56(telephone);
    console.log(encodedTel);
    if (encodedTel === telephone) throw new Error();

    const registerForm = {
      uid: this.token.uid,
      profileImage: this.token.picture,
      ...subRegisterForm,
      telephone: encodedTel,
    };

    await Registered.findOneAndUpdate({ uid: this.token.uid }, registerForm, {
      upsert: true,
      new: true,
    });

    return;
  }

  async approve(uid: string) {
    const user = await Registered.findOne({ uid }, "-_id -__v");
    if (!user) return;

    const userForm = {
      ...user.toObject(),
      registerDate: new Date(),
      isActive: true,
      role: "member",
    };

    await User.create(userForm);
    await this.deleteRegisterUser(uid);

    return;
  }

  async deleteRegisterUser(uid: string) {
    await Registered.deleteOne({ uid });
  }

  async getRegister() {
    const users = await Registered.find({});

    users.forEach(async (user) => {
      user.telephone = await this.decodeByAES256(user.telephone);
    });

    return users;
  }
}
