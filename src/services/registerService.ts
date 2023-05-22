import { JWT } from "next-auth/jwt";
import { IRegistered, Registered } from "../db/models/registered";
import { User } from "../db/models/user";

export default class RegisterService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async register(subRegisterForm: Omit<IRegistered, "uid" | "profileImage">) {
    const registerForm = {
      uid: this.token.uid,
      profileImage: this.token.picture,
      ...subRegisterForm,
    };
    await Registered.create(registerForm);
    // await Registered.collection.insertOne(registerForm);

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
