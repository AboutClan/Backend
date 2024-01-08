//전자는 스터디 참여에 투표를 해 놓고 OPEN도 되어 있어서 와야만 하는 상황에서,
//출석체크도 안하고, 불참버튼도 안 누른 인원(말 그대로 잠수한 인원)을 체크해서 보증금에서 -1000원을 하면 되는거예요!

import dayjs from "dayjs";
import VoteService from "./voteService";
import { strToDate } from "../utils/dateUtils";
import { IUser, User, UserSchema } from "../db/models/user";
import UserService from "./userService";
import { JWT } from "next-auth/jwt";

export default class AdminManageService {
  private token: JWT;
  voteServiceInstance: VoteService;
  userServiceInstance: UserService;
  constructor(token?: JWT) {
    this.token = token as JWT;
    this.voteServiceInstance = new VoteService(this.token);
    this.userServiceInstance = new UserService(this.token);
  }

  async absenceManage() {
    try {
      const date = strToDate(dayjs().format("YYYY-MM-DD").toString());

      const vote = await this.voteServiceInstance.getVote(date);
      const unUser: any[] = [];

      vote.participations.forEach((participation) => {
        if (participation.status === "open") {
          participation.attendences?.forEach((attendence) => {
            if (
              !attendence["arrived"] &&
              !participation.absences?.some(
                (user) =>
                  (attendence.user as IUser).uid == (user.user as IUser).uid
              )
            ) {
              unUser.push((attendence.user as IUser).uid);
            }
          });
        }
      });

      //   unUser.forEach(async (userId: any) => {
      //     const user = await User.findOne({ uid: userId });
      //     if (!user) throw new Error();
      //     user.deposit -= 1000;
      //     await user.save();
      //   });
    } catch (err: any) {
      throw new Error(err);
    }
  }

  //월별 정산은 매월 1일에 "human"과 "member" 인원에 대해서(가입일이 그 전 달인 인원 제외.
  //8월 1일에 정산을 한다면 7월 가입자는 제외) 출석체크를 기록이 없는 경우 보증금에서 -1000원을 하면 돼요!
  async monthCalc() {
    try {
      const users = await User.find({
        $or: [{ role: "human" }, { role: "member" }],
      });

      const fUsers = users.filter((user) => {
        const thisMonth = dayjs().get("M") + 1;
        const regMonth = dayjs(user.registerDate).get("M") + 1;

        return thisMonth - regMonth !== 1;
      });

      const lastMonthStart = dayjs()
        .subtract(1, "month")
        .startOf("month")
        .toString();
      const lastMonthEnd = dayjs()
        .subtract(1, "month")
        .endOf("month")
        .toString();

      const participationRate =
        await this.userServiceInstance.getParticipationRate(
          lastMonthStart,
          lastMonthEnd,
          true
        );
      return fUsers;
      const notPartUsers: any[] = [];
      fUsers.forEach((user) => {
        const idx = participationRate.findIndex(
          (participant) => user.uid == participant.uid
        );

        if (idx !== -1) {
          if (participationRate[idx].cnt == 0)
            notPartUsers.push(participationRate[idx].uid);
        }
      });

      notPartUsers.forEach(async (uid) => {
        const user = await User.findOne({ uid });
        if (!user) {
          throw new Error();
        }

        user.deposit -= 1000;
        await user.save();
      });
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
