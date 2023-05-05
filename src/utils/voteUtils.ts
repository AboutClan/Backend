import { Vote } from "../db/models/vote";

export const findOneVote = (date: Date) =>
  Vote.findOne({ date }).populate([
    "participations.place",
    "participations.attendences.user",
    "participations.absences.user",
  ]);
