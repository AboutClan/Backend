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
import { group } from "console";

export default class GroupStudyService {
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

  async getGroupStudy() {
    try {
      const gatherData = await GroupStudy.find()
        .populate(["organizer", "participants.user", "waiting.user"])
        .select("-_id");
      return gatherData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createGroupStudy(data: IGroupStudyData) {
    const nextId = await this.getNextSequence("groupStudyId");

    const groupStudyInfo = {
      ...data,
      id: nextId,
    };
    try {
      const groupStudyData = groupStudyInfo;
      await GroupStudy.create(groupStudyData);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async participateGroupStudy(id: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      if (
        !groupStudy.participants.some(
          (participant) => participant.user == (this.token.id as IUser)
        )
      ) {
        groupStudy.participants.push({
          user: this.token.id as IUser,
          role: "member",
        });
        groupStudy.attendance.thisWeek.push({
          uid: this.token.uid as string,
          name: this.token.name as string,
          attendRecord: [],
        });
        groupStudy.attendance.lastWeek.push({
          uid: this.token.uid as string,
          name: this.token.name as string,
          attendRecord: [],
        });
        await groupStudy?.save();
      }

      return;
    } catch (err) {
      throw new Error();
    }
  }
  async deleteParticipate(id: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      groupStudy.participants = groupStudy.participants.filter(
        (participant) => participant.user != (this.token.id as IUser)
      );
      await groupStudy.save();
    } catch (err) {
      throw new Error();
    }
    return;
  }

  async getWaitingPerson(id: string) {
    try {
      const data = await GroupStudy.findOne({ id })
        .populate(["waiting.user"])
        .select("-_id");

      return data;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async setWaitingPerson(id: string, answer?: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      const user = { user: this.token.id as IUser, answer };
      if (groupStudy?.waiting) {
        if (groupStudy.waiting.includes(user)) {
          return;
        }
        groupStudy.waiting.push(user);
      } else {
        groupStudy.waiting = [user];
      }
      await groupStudy?.save();
    } catch (err) {
      throw new Error();
    }
  }
  async agreeWaitingPerson(id: string, userId: string, status: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      groupStudy.waiting = groupStudy.waiting.filter(
        (who) => who.user.toString() !== userId
      );
      if (status === "agree") {
        groupStudy.participants.push({ user: userId, role: "member" });
      }

      await groupStudy?.save();
      
    } catch (err) {
      throw new Error();
    }
  }

  async getAttendanceGroupStudy(id: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      return groupStudy.attendance;
    } catch (err) {
      throw new Error();
    }
  }
  async attendGroupStudy(id: string, weekRecord: string[]) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      const findUser = groupStudy.attendance.thisWeek.find(
        (who) => who.uid === this.token.uid + ""
      );

      if (findUser) findUser.attendRecord = weekRecord;
      else
        groupStudy.attendance.thisWeek.push({
          name: this.token.name as string,
          uid: this.token.uid as string,
          attendRecord: weekRecord,
        });

      await groupStudy?.save();

      return;
    } catch (err) {
      throw new Error();
    }
  }
}
