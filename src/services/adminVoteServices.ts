import dayjs, { Dayjs } from "dayjs";
import { now, strToDate } from "../utils/dateUtils";
import { Vote } from "../db/models/vote";

type voteTime = { start: Dayjs | Date; end: Dayjs | Date };

export default class AdminVoteService {
  constructor() {}

  checkTimeOverlap = (timeArr: voteTime[]) => {
    timeArr.sort((a, b) => (a.end.toString() > b.end.toString() ? -1 : 1));
    let endTime = timeArr[0].end;
    timeArr.sort((a, b) => (a.start.toString() > b.start.toString() ? 1 : -1));
    let startTime = timeArr[0].start;

    const arr: any[] = [];
    while (startTime <= endTime) {
      arr.push(0);
      timeArr.forEach((time) => {
        if (time.start <= startTime && startTime <= time.end) {
          arr[arr.length - 1]++;
        }
      });

      let overlapCnt = 0;
      for (let i = 0; i < arr.length; i++) {
        //3명 이상 겹치는 시간  1시간 이상인지 확인
        if (arr[i] >= 3) overlapCnt++;
        else overlapCnt = 0;

        if (overlapCnt >= 3) return timeArr[1];
      }

      startTime = dayjs(startTime).add(30, "minutes").toDate();
    }

    return null;
  };

  async confirm(dateStr: string) {
    console.log(1);
    const date = strToDate(dateStr).toDate();
    const vote = await Vote.findOne({ date });
    const failure = new Set();

    if (vote?.participations.some((p) => p.status === "pending")) {
      vote?.participations?.map((participation) => {
        const timeObj: voteTime[] = [];

        participation.attendences?.map((attendance) => {
          if (attendance.firstChoice) {
            if (attendance.time.start && attendance.time.end) {
              timeObj.push({
                start: attendance.time.start,
                end: attendance.time.end,
              });
            } else {
              timeObj.push({
                start: now(),
                end: now().add(1, "hours"),
              });
            }
          }
        });

        let result;
        if (timeObj.length) result = this.checkTimeOverlap(timeObj);

        if (result) {
          participation.status = "open";
          participation.startTime = result.start as Date;
          participation.endTime = result.end as Date;
        } else {
          participation.status = "dismissed";
        }
      });

      //매칭 실패한 사람들 전부 failure에 추가
      vote?.participations?.map((participation) => {
        if (participation.status === "dismissed") {
          participation.attendences?.map((attendance) => {
            if (attendance.firstChoice) failure.add(attendance.user.toString());
          });
        }
      });
      //open장소에 failure에 있는 사람이 2지망 투표 했으면 1지망으로 바꿔줌
      vote?.participations?.map((participation) => {
        if (participation.status === "open") {
          participation.attendences?.map((attendance) => {
            if (
              !attendance.firstChoice &&
              failure.has(attendance.user.toString())
            ) {
              attendance.firstChoice = true;
              failure.delete(attendance.user.toString());
            }
          });
        }
      });

      //실패한 장소에서 2지망 투표한 사람들끼리 오픈할 수 있는지 확인
      vote?.participations?.map(async (participation) => {
        if (participation.status === "dismissed") {
          participation.attendences = participation.attendences?.filter(
            (attendance) => failure.has(attendance.user.toString())
          );

          const timeObj: voteTime[] = [];

          participation.attendences?.map((attendance) => {
            if (attendance.time.end && attendance.time.start) {
              timeObj.push({
                start: attendance.time.start,
                end: attendance.time.end,
              });
            } else {
              timeObj.push({
                start: now(),
                end: now().add(1, "hours"),
              });
            }
          });

          let result;
          if (timeObj.length) result = this.checkTimeOverlap(timeObj);
          if (timeObj.length && result) {
            participation.status = "open";
            participation.startTime = result.start as Date;
            participation.endTime = result.end as Date;
            participation.attendences?.forEach((attendance) => {
              attendance.firstChoice = true;
              failure.delete(attendance.user.toString());
            });
          }
        }
      });
      await vote?.save();
    }
  }

  async waitingConfirm(dateStr: string) {
    const date = strToDate(dateStr).toDate();
    const vote = await Vote.findOne({ date });

    vote?.participations.forEach((participation) => {
      if (participation.attendences?.length === 0) {
        participation.status = "dismissed";
      } else {
        participation.status = "waiting_confirm";
      }
    });

    await vote?.save();
    return;
  }

  async deleteVote() {
    const day = now().add(2, "days").toDate();
    await Vote.deleteMany({ date: { $gte: day } });
    return;
  }
}
