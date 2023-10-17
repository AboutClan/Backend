import { Vote } from "../db/models/vote";

export const findOneVote = async (date: Date) =>
  await Vote.findOne({ date })
    .sort({ date: -1 })
    .populate([
      "participations.place",
      "participations.attendences.user",
      "participations.absences.user",
    ]);
