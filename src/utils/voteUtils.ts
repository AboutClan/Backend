import { RealtimeModel } from "../db/models/realtime";
import { Vote } from "../db/models/vote";

export const findOneVote = async (date: Date) =>
  await Vote.findOne({ date }).populate([
    "participations.place",
    "participations.attendences.user",
    "participations.absences.user",
  ]);

export const findOneRealTime = async (date: Date) =>
  await RealtimeModel.findOne({ date }).populate([
    "participations.place",
    "participations.attendences.user",
    "participations.absences.user",
  ]);

export const findTwoVote = async (date: Date) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const votes = await Vote.find({
    date: {
      $gte: date,
      $lte: nextDay, // 다음날 전까지의 데이터를 가져옴
    },
  }).populate([
    "participations.place",
    "participations.attendences.user",
    "participations.absences.user",
  ]);
  return votes;
};
