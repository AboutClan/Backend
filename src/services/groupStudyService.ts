import dayjs from "dayjs";
import { JWT } from "next-auth/jwt";
import { Counter } from "../db/models/counter";
import { GroupStudy, IGroupStudyData } from "../db/models/groupStudy";
import { IUser, User } from "../db/models/user";

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
      const groupStudyData = await GroupStudy.find()
        .populate([
          "organizer",
          "participants.user",
          "waiting.user",
          "comment.user",
        ])
        .select("-_id");
      return groupStudyData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createGroupStudy(data: IGroupStudyData) {
    const nextId = await this.getNextSequence("groupStudyId");

    const groupStudyInfo: IGroupStudyData = {
      ...data,
      participants: [
        {
          user: data.organizer._id,
          role: "admin",
          attendCnt: 0,
        },
      ],
      attendance: {
        firstDate: undefined,
        lastWeek: [],
        thisWeek: [],
      },
      id: nextId as number,
    };
    try {
      const groupStudyData = groupStudyInfo;
      await GroupStudy.create(groupStudyData);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async updateGroupStudy(data: IGroupStudyData) {
    const groupStudy = await GroupStudy.findOne({ id: data.id });
    if (!groupStudy) throw new Error();

    try {
      Object.assign(groupStudy, data);
      await groupStudy.save();
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
          attendCnt: 0,
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

      groupStudy.attendance.lastWeek = groupStudy.attendance.lastWeek.filter(
        (who) => who.uid !== this.token.uid + ""
      );
      groupStudy.attendance.thisWeek = groupStudy.attendance.thisWeek.filter(
        (who) => who.uid !== this.token.uid + ""
      );
      await groupStudy.save();
    } catch (err) {
      throw new Error();
    }
    return;
  }

  async exileParticipate(id: string, toUid: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      // groupStudy.participants = groupStudy.participants.filter(
      //   (participant) => participant.user !== toUid
      // );

      // groupStudy.attendance.lastWeek = groupStudy.attendance.lastWeek.filter(
      //   (who) => who.uid !== toUid + ""
      // );
      // groupStudy.attendance.thisWeek = groupStudy.attendance.thisWeek.filter(
      //   (who) => who.uid !== toUid + ""
      // );
      await groupStudy.save();
      return "test";
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

  async setWaitingPerson(id: string, pointType: string, answer?: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      const user = { user: this.token.id as IUser, answer, pointType };
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
        groupStudy.participants.push({
          user: userId,
          role: "member",
          attendCnt: 0,
        });
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

  async patchAttendanceWeek(id: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      const firstDate = dayjs()
        .subtract(1, "day")
        .startOf("week")
        .add(1, "day")
        .format("YYYY-MM-DD");

      groupStudy.attendance.firstDate = firstDate;
      groupStudy.attendance.lastWeek = groupStudy.attendance.thisWeek;
      groupStudy.attendance.thisWeek = [];

      await groupStudy.save();
    } catch (err) {
      throw new Error();
    }
  }
  async attendGroupStudy(
    id: string,
    weekRecord: string[],
    type: string,
    weekRecordSub?: string[]
  ) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      const firstDate = dayjs()
        .subtract(1, "day")
        .startOf("week")
        .add(1, "day")
        .format("YYYY-MM-DD");

      if (type === "this") groupStudy.attendance.firstDate = firstDate;

      const weekData =
        type === "this"
          ? groupStudy.attendance.thisWeek
          : groupStudy.attendance.lastWeek;

      const findUser = weekData.find((who) => who.uid === this.token.uid + "");
      const findMember = groupStudy.participants.find(
        (who) => who.user.toString() === (this.token.id as string)
      );

      if (findUser) {
        const beforeCnt = findUser.attendRecord.length;
        if (findMember) {
          findMember.attendCnt += -beforeCnt + weekRecord.length;
        }
        findUser.attendRecord = weekRecord;
        findUser.attendRecordSub = weekRecordSub;
      } else {
        const data = {
          name: this.token.name as string,
          uid: this.token.uid as string,
          attendRecord: weekRecord,
          attendRecordSub: weekRecordSub,
        };
        if (findMember) {
          findMember.attendCnt += weekRecord.length;
        }
        if (type === "this") {
          groupStudy.attendance.thisWeek.push(data);
        }
        if (type === "last") groupStudy.attendance.lastWeek.push(data);
      }

      await groupStudy?.save();

      return;
    } catch (err) {
      throw new Error();
    }
  }

  async createComment(groupStudyId: string, comment: string) {
    const groupStudy = await GroupStudy.findOne({ id: groupStudyId });
    if (!groupStudy) throw new Error();

    try {
      if (groupStudy?.comment) {
        groupStudy.comment.push({
          user: this.token.id as IUser,
          comment,
        });
      } else {
        groupStudy.comment = [
          {
            user: this.token.id as IUser,
            comment,
          },
        ];
      }

      await groupStudy.save();
    } catch (err) {
      throw new Error();
    }
  }

  async deleteComment(groupStudyId: string, commentId: string) {
    const groupStudy = await GroupStudy.findOne({ id: groupStudyId });
    if (!groupStudy) throw new Error();

    try {
      groupStudy.comment = groupStudy.comment.filter(
        (com: any) => (com._id as string) != commentId
      );

      await groupStudy.save();
    } catch (err) {
      throw new Error();
    }
  }

  async patchComment(groupStudyId: string, commentId: string, comment: string) {
    const groupStudy = await GroupStudy.findOne({ id: groupStudyId });
    if (!groupStudy) throw new Error();

    try {
      groupStudy.comment.forEach(async (com: any) => {
        if ((com._id as string) == commentId) {
          com.comment = comment;
          await groupStudy.save();
        }
      });
      return;
    } catch (err) {
      throw new Error();
    }
  }
  async belongToParticipateGroupStudy() {
    const groupStudies = await GroupStudy.find({});
    const allUser = await User.find({ isActive: true });
    if (!groupStudies) throw new Error();

    const checkGroupBelong = (hashArr: string) => {
      let belong;
      hashArr?.split("#").forEach((hash) => {
        // 해시태그에서 불필요한 공백 제거
        const trimmedHash = hash.trim();
        if (trimmedHash.match(/^[A-Z]/)) {
          belong = trimmedHash;
          return;
        }
      });
      return belong;
    };

    try {
      let a = "test";
      let b = "test2";
      let c = "test3";

      for (const group of groupStudies) {
        const belong = checkGroupBelong(group.hashTag);
        if (!belong) return;
        if (belong) a = belong as unknown as string;

        for (const who of allUser) {
          if (who?.belong) c = who.belong;
          if (
            belong &&
            who?.belong &&
            who.belong.length > 2 &&
            who.belong === belong
          ) {
            b = belong;
            if (
              !group.participants.some(
                (participant) => participant.user == who._id
              )
            ) {
              group.participants.push({
                user: who._id,
                role: "member",
                attendCnt: 0,
              });
              group.attendance.thisWeek.push({
                uid: who.uid,
                name: who.name,
                attendRecord: [],
              });
              group.attendance.lastWeek.push({
                uid: who.uid,
                name: who.name,
                attendRecord: [],
              });
            }
            await group.save(); // 여기서 비동기 처리가 올바르게 기다려집니다.
          }
        }
      }

      return { a, b, allUser };
    } catch (err) {
      throw new Error();
    }
  }
}
