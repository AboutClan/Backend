import { Vote } from "../db/models/vote";

export const findOneVote = async (date: Date) =>
  await Vote.findOne({ date }).populate([
    "participations.place",
    "participations.attendences.user",
    "participations.absences.user",
  ]);
