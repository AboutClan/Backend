import { JWT } from "next-auth/jwt";
import {
  GroupStudy,
  IGroupStudyData,
  GroupStudyStatus,
} from "../db/models/groupStudy";
import { IUser, User } from "../db/models/user";
import { v4 as uuidv4 } from "uuid";
import { Counter } from "../db/models/counter";
import dbConnect from "../db/conn";

export default class groupStudyService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getNextSequence(name: any) {
    const counter = await Counter.findOne({ key: name });
    if (counter) {
      counter.seq++;

      await counter.save();
      return counter.seq;
    }
  }
}
