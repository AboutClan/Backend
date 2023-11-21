import dayjs, { Dayjs } from "dayjs";
import { now, strToDate } from "../utils/dateUtils";
import { IAttendance, IParticipation, Vote } from "../db/models/vote";

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

  checkStudyOpen = (type: "onlyFirst" | "all", atts?: IAttendance[]) => {
    const timeObj: voteTime[] = [];
    atts?.forEach((att) => {
      if (type === "onlyFirst" ? att.firstChoice : true) {
        if (att.time.start && att.time.end) {
          timeObj.push({
            start: att.time.start,
            end: att.time.end,
          });
        }
      }
    });
    return timeObj;
  };

  setStudyOpen = (participation: IParticipation, resultTime: any) => {
    participation.status = "open";
    participation.startTime = resultTime.start as Date;
    participation.endTime = resultTime.end as Date;
  };

  async confirm(dateStr: string) {
    const date = strToDate(dateStr).toDate();
    const vote = await Vote.findOne({ date });
    const failure = new Set();

    const participations = vote?.participations;

    try {
      if (
        dayjs(dateStr).month() < 10 &&
        participations?.some((p) => p.status !== "pending")
      ) {
        //1지망만으로 매칭
        participations?.forEach((participation) => {
          if (participation.status === "free") return;

          const timeObj = this.checkStudyOpen(
            "onlyFirst",
            participation.attendences
          );

          let result;
          if (timeObj.length) result = this.checkTimeOverlap(timeObj);

          if (result) this.setStudyOpen(participation, result);
          else participation.status = "dismissed";
        });

        //1지망 투표 매칭에 실패한 사람들 failure에 추가
        participations?.forEach((participation) => {
          if (participation.status === "dismissed") {
            participation.attendences?.forEach((attendance) => {
              if (attendance.firstChoice) {
                failure.add(attendance.user.toString());
              }
            });
          }
        });

        //1지망 투표 매칭에 실패한 사람들 중 오픈된 장소에 2지망 넣었으면 거기로 이동
        participations?.forEach((participation) => {
          if (participation.status === "open") {
            participation.attendences?.forEach((attendance) => {
              const user = attendance.user.toString;
              if (failure.has(user)) {
                attendance.firstChoice = true;
                failure.delete(user);
              }
            });
          }
        });

        //실패한 장소에서 2지망 투표한 사람들끼리 오픈할 수 있는지 확인
        //성공한 사람들이 dismissed에 있는 경우 제거가 되지만, 순차적으로 진행되기 때문에 뒤에서 확정난 인원은 앞에서는 제거가 안되었음.
        participations?.forEach((participation) => {
          if (participation.status === "dismissed") {
            //이미 성공한 사람들은 제거
            participation.attendences = participation.attendences?.filter(
              (attendance) => failure.has(attendance.user.toString())
            );

            const timeObj = this.checkStudyOpen(
              "all",
              participation.attendences
            );
            let result;
            if (timeObj.length) result = this.checkTimeOverlap(timeObj);

            if (result) {
              this.setStudyOpen(participation, result);
              participation.attendences?.forEach((attendance) => {
                attendance.firstChoice = true;
                failure.delete(attendance.user.toString());
              });
            }
          }
        });

        //한번 더 open된 장소에 신청이 되어 있는 경우는 거기로 이동(2지망 투표자)
        participations?.forEach((participation) => {
          if (participation.status === "open") {
            participation.attendences?.forEach((attendance) => {
              if (failure.has(attendance.user.toString())) {
                attendance.firstChoice = true;
                failure.delete(attendance.user.toString());
              }
            });
          }
        });

        //한번 더 dismissed에서 이미 성공한 사람들을 제거함. 실패한 사람들인 failure에 있는 경우들만 남김.
        participations?.forEach((participation) => {
          if (participation.status === "dismissed") {
            participation.attendences = participation.attendences?.filter(
              (attendance) => failure.has(attendance.user.toString())
            );
          }
        });

        if (vote) {
          participations[0].status === "open";
          participations[1].status === "open";
          vote.participations[0].status = "open";
          vote.participations[1].status = "open";
          vote.participations[2].status = "open";
          vote.participations[3].status = "open";
          vote.participations[4].status = "open";
        }

        await vote?.save();
        return participations;
      }
    } catch (err) {
      throw new Error();
    }

    return;
  }

  async waitingConfirm(dateStr: string) {
    try {
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
    } catch (err) {
      throw new Error();
    }
    return;
  }

  async deleteVote() {
    try {
      const day = now().add(2, "days").toDate();
      await Vote.deleteMany({ date: { $gte: day } });
    } catch (err) {
      throw new Error();
    }
    return;
  }
}
