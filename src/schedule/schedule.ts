import dayjs from "dayjs";
import { User } from "../db/models/user";
import AdminVoteService from "../services/adminVoteServices";

const schedule = require("node-schedule");

//투표 결과 발표
export const voteResult = schedule.scheduleJob("0 10 * * *", async () => {
  try {
    const adminVoteServiceInstance = new AdminVoteService();
    await adminVoteServiceInstance.confirm(dayjs().toDate().toString());
    console.log("vote result succeess");
  } catch (err: any) {
    throw new Error(err);
  }
});

//매월 monthScore 초기화
export const initMonthScore = schedule.scheduleJob("0 0 1 * *", async () => {
  try {
    const users = await User.find();
    if (!users) throw new Error();

    users.forEach((user) => {
      user.monthScore = 0;
      user.save();
    });
  } catch (err: any) {
    throw new Error(err);
  }
});