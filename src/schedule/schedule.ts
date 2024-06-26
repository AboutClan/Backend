import dayjs from "dayjs";
import { User } from "../db/models/user";
import AdminVoteService from "../services/adminVoteServices";
import WebPushService from "../services/webPushService";

const schedule = require("node-schedule");

export function sendNoti() {
  try {
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [2, 4, 5, 6]; // 화, 목, 토
    rule.hour = 18; // 오후 6시
    rule.minute = 0;
    rule.tz = "Asia/Seoul"; // 한국 시간대

    const webPushServiceInstance = new WebPushService();

    const sendNotification = () => {
      console.log("알림을 사용자에게 보냅니다.");
      // 여기에 알림을 보내는 로직을 추가하세요.
    };

    const job = schedule.scheduleJob(
      rule,
      webPushServiceInstance.sendNotificationAllUser,
    );
  } catch (err: any) {
    throw new Error(err);
  }
}
sendNoti();

// export const noti = schedule.scheduleJob("*/1 * * * *", () => {
//   console.log("Sending request...");
//   const webPushServiceInstance = new WebPushService();
//   webPushServiceInstance.sendNotificationAllUser();
//   return;
// });

//투표 결과 발표
export const voteResult = schedule.scheduleJob("0 11 * * *", async () => {
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
    await User.updateMany({}, { monthScore: 0 });
    console.log("month score init success");
  } catch (err: any) {
    throw new Error(err);
  }
});
