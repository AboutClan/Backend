import dayjs from "dayjs";
import { JWT } from "next-auth/jwt";
import { Counter } from "../db/models/counter";
import {
  GroupStudy,
  IGroupStudyData,
  subCommentType,
} from "../db/models/groupStudy";
import { IUser, User } from "../db/models/user";
import WebPushService from "./webPushService";

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

  async getGroupStudyByFilterAndCategory(
    filter: string,
    category: string,
    cursor: number | null,
  ) {
    let groupStudyData;
    const gap = 8;
    let start = gap * (cursor || 0);

    const filterQuery = { status: filter, "category.main": category };

    groupStudyData = await GroupStudy.find(filterQuery)
      .skip(start)
      .limit(gap)
      .populate({
        path: "organizer",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "participants.user",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "waiting.user",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "comments.user",
        select: "name profileImage uid score avatar comment location",
      })
      .select("-_id");

    return groupStudyData;
  }

  async getGroupStudyByFilter(filter: string, cursor: number | null) {
    let groupStudyData;
    const gap = 7;
    let start = gap * (cursor || 0);

    const filterQuery = { status: filter };

    groupStudyData = await GroupStudy.find(filterQuery)
      .skip(start)
      .limit(gap)
      .populate({
        path: "organizer",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "participants.user",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "waiting.user",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "comments.user",
        select: "name profileImage uid score avatar comment location",
      })
      .select("-_id");

    return groupStudyData;
  }

  async getGroupStudyByCategory(category: string) {
    try {
      const groupStudyData = await GroupStudy.find({
        "category.main": category,
      })
        .populate({
          path: "organizer",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "participants.user",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "waiting.user",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "comments.user",
          select: "name profileImage uid score avatar comment location",
        })
        .select("-_id");

      return groupStudyData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getGroupStudyById(groupStudyId: string) {
    try {
      const groupStudyIdNum = parseInt(groupStudyId);

      const groupStudyData = await GroupStudy.findOne({ id: groupStudyIdNum })
        .populate({
          path: "organizer",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "participants.user",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "waiting.user",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "comments.user",
          select: "name profileImage uid score avatar comment location",
        })
        .select("-_id");

      return groupStudyData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getUserParticipatingGroupStudy() {
    const userParticipatingGroupStudy = await GroupStudy.find({
      "participants.user": this.token.id as string,
    })
      .populate({
        path: "organizer",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "participants.user",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "waiting.user",
        select: "name profileImage uid score avatar comment",
      })
      .populate({
        path: "comments.user",
        select: "name profileImage uid score avatar comment location",
      })
      .select("-_id");

    return userParticipatingGroupStudy;
  }

  async getGroupStudy(cursor: number | null) {
    try {
      const gap = 7;
      let start = gap * (cursor || 0);

      const groupStudyData = await GroupStudy.find()
        .skip(start)
        .limit(gap + 1)
        // .populate([
        //   "organizer",
        //   "participants.user",
        //   "waiting.user",
        //   "comments.user",
        // ])
        .populate({
          path: "organizer",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "participants.user",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "waiting.user",
          select: "name profileImage uid score avatar comment",
        })
        .populate({
          path: "comments.user",
          select: "name profileImage uid score avatar comment location",
        })
        .select("-_id");

      return groupStudyData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createSubComment(
    groupStudyId: string,
    commentId: string,
    content: string,
  ) {
    try {
      const message: subCommentType = {
        user: this.token.id,
        comment: content,
      };

      await GroupStudy.updateMany({}, { $rename: { comment: "comments" } });
      await GroupStudy.updateOne(
        {
          _id: groupStudyId,
          "comments._id": commentId,
        },
        { $push: { "comments.$.subComments": message } },
      );

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async deleteSubComment(
    groupStudyId: string,
    commentId: string,
    subCommentId: string,
  ) {
    try {
      await GroupStudy.updateOne(
        {
          _id: groupStudyId,
          "comments._id": commentId,
        },
        { $pull: { "comments.$.subComments": { _id: subCommentId } } },
      );
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateSubComment(
    groupStudyId: string,
    commentId: string,
    subCommentId: string,
    comment: string,
  ) {
    try {
      await GroupStudy.updateOne(
        {
          _id: groupStudyId,
          "comments._id": commentId,
          "comments.subComments._id": subCommentId,
        },
        { $set: { "comments.$[].subComments.$[sub].comment": comment } },
        {
          arrayFilters: [{ "sub._id": subCommentId }],
        },
      );

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createGroupStudy(data: IGroupStudyData) {
    const nextId = await this.getNextSequence("groupStudyId");

    console.log(data);

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
    console.log(data);
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
          (participant) => participant.user == this.token.id,
        )
      ) {
        groupStudy.participants.push({
          user: this.token.id,
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

      const webPushService = new WebPushService(this.token);
      webPushService.sendNotificationGroupStudy(id);

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
        (participant) => participant.user != this.token.id,
      );

      groupStudy.attendance.lastWeek = groupStudy.attendance.lastWeek.filter(
        (who) => who.uid !== this.token.uid + "",
      );
      groupStudy.attendance.thisWeek = groupStudy.attendance.thisWeek.filter(
        (who) => who.uid !== this.token.uid + "",
      );
      await groupStudy.save();
    } catch (err) {
      throw new Error();
    }
    return;
  }

  async exileParticipate(id: string, toUid: string, randomId?: number) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      if (!randomId) {
        groupStudy.participants = groupStudy.participants.filter(
          (participant) => participant.user != toUid,
        );

        groupStudy.attendance.lastWeek = groupStudy.attendance.lastWeek.filter(
          (who) => who.uid !== toUid + "",
        );
        groupStudy.attendance.thisWeek = groupStudy.attendance.thisWeek.filter(
          (who) => who.uid !== toUid + "",
        );
      } else {
        groupStudy.participants = groupStudy.participants.filter(
          (participant) => participant.randomId !== randomId,
        );
      }
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

  async setWaitingPerson(id: string, pointType: string, answer?: string) {
    const groupStudy = await GroupStudy.findOne({ id });
    if (!groupStudy) throw new Error();

    try {
      const user = { user: this.token.id, answer, pointType };
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
        (who) => who.user.toString() !== userId,
      );
      if (status === "agree") {
        groupStudy.participants.push({
          user: userId,
          role: userId ? "member" : "outsider",
          attendCnt: 0,
          randomId: userId ? undefined : Math.floor(Math.random() * 100000),
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
    weekRecordSub?: string[],
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
        (who) => who.user.toString() === (this.token.id as string),
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
    const groupStudy = await GroupStudy.findOne({ _id: groupStudyId });
    if (!groupStudy) throw new Error();

    try {
      if (groupStudy?.comments) {
        groupStudy.comments.push({
          user: this.token.id,
          comment,
        });
      } else {
        groupStudy.comments = [
          {
            user: this.token.id,
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
      groupStudy.comments = groupStudy.comments.filter(
        (com: any) => (com._id as string) != commentId,
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
      groupStudy.comments.forEach(async (com: any) => {
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
        if (/[A-Z]/.test(trimmedHash)) {
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

      groupStudies.forEach(async (group) => {
        const belong = checkGroupBelong(group.hashTag);
        if (!belong || belong == "C++") return;
        if (belong) a = belong as unknown as string;

        allUser.forEach(async (who) => {
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
                (participant) => participant.user == who._id,
              )
            ) {
              await group.participants.push({
                user: who?._id,
                role: "member",
                attendCnt: 0,
              });
              await group.attendance.thisWeek.push({
                uid: who?.uid,
                name: who?.name,
                attendRecord: [],
              });
              await group.attendance.lastWeek.push({
                uid: who?.uid,
                name: who?.name,
                attendRecord: [],
              });
            }
          }
        });

        await group.save();
      });
      return { a, b, allUser };
    } catch (err) {
      throw new Error();
    }
  }
}
