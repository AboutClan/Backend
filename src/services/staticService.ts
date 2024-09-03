import { JWT } from "next-auth/jwt";
import { Log } from "../db/models/log";
import { User } from "../db/models/user";
import { DatabaseError } from "../errors/DatabaseError";
import e from "express";

export default class StaticService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async roleCheck() {
    const authorized = ["previliged", "manager"];
    const user = await User.findOne({ uid: this.token.uid }).select("role");
    if (!user || !user.role) return false;

    if (authorized.includes(user.role)) return true;
    else return false;
  }

  async getUserInSameLocation(month: number = 1) {
    const manager = await User.findById(this.token.id);
    if (!manager) throw new DatabaseError("no user");
    const managerLocation = manager.location;

    const usersInSameLocation = await User.find({
      location: managerLocation,
    }).select("uid name");

    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - month);

    //번개 모임
    //소모임 가입

    //개인 스터디
    const selfStudy = await Log.collection
      .aggregate([
        {
          $match: {
            message: "개인 스터디 인증", // message 필터링
            timestamp: {
              $gte: oneMonthAgo, // 한 달 이내의 timestamp 필터링
            },
          },
        },
        {
          $group: {
            _id: "$meta.uid", // meta.uid별로 그룹화
            selfStudyCount: { $sum: 1 }, // 각 그룹의 개수를 세어 count에 저장
          },
        },
        {
          $sort: { count: -1 }, // count 기준으로 내림차순 정렬
        },
      ])
      .toArray();

    //스터디 출석
    const attend = await Log.collection
      .aggregate([
        {
          $match: {
            message: "일일 출석", // message 필터링
            timestamp: {
              $gte: oneMonthAgo, // 한 달 이내의 timestamp 필터링
            },
          },
        },
        {
          $group: {
            _id: "$meta.uid", // meta.uid별로 그룹화
            attendCount: { $sum: 1 }, // 각 그룹의 개수를 세어 count에 저장
          },
        },
        {
          $sort: { count: -1 }, // count 기준으로 내림차순 정렬
        },
      ])
      .toArray();

    const updatedArr2 = selfStudy
      .filter((item1) => {
        // matchedItem이 존재하는 경우에만 필터 통과
        return usersInSameLocation.some((item2) => item2.uid == item1._id);
      })
      .map((item1) => {
        const matchedItem = usersInSameLocation.find(
          (item2) => item2.uid == item1._id,
        );
        if (matchedItem) {
          return { ...item1, _id: matchedItem.name };
        }
      });

    let updatedArr = usersInSameLocation.map((user) => {
      const matched = selfStudy.find((info) => user.uid == info._id);
      if (matched)
        return { ...user.toJSON(), selfStudyCnt: matched.selfStudyCount };
      return { ...user.toJSON(), selfStudyCnt: 0 };
    });

    updatedArr = updatedArr.map((user) => {
      const matched = attend.find((info) => user.uid == info._id);
      if (matched) return { ...user, attendCnt: matched.attendCount };
      return { ...user, attendCnt: 0 };
    });

    const cleanedArr = updatedArr.map((obj) => {
      const { _id, uid, ...rest } = obj;
      return rest;
    });

    console.log(cleanedArr);
    return cleanedArr;
  }

  async monthlyStatics() {}
}
