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

    const cipher = CryptoJS.AES.encrypt(tel, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Utf8.parse(""),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    return cipher.toString();
  }

  async decodeByAES256(encodedTel: string) {
    const key = process.env.cryptoKey;
    if (!key) return encodedTel;

    const cipher = CryptoJS.AES.decrypt(
      encodedTel,
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(""),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }
    );
    return cipher.toString(CryptoJS.enc.Utf8);
  }

  async register(subRegisterForm: Omit<IRegistered, "uid" | "profileImage">) {
    const { telephone } = subRegisterForm;
    const encodedTel = await this.encodeByAES56(telephone);
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
      isActive: false,
      point: 0,
      role: "member",
      score: 0,
      comment: "",
    };

    await User.create(userForm);
    await this.deleteRegisterUser(uid);

    return;
  }

  async deleteRegisterUser(uid: string) {
    await Registered.deleteOne({ uid });
  }
}
