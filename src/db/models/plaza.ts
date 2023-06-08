import { Dayjs } from "dayjs";
import mongoose, { model, Model, Schema } from "mongoose";

interface IVoteList {
  voteListIdx: number;
  value: string;
}

export interface restType {
  type: string;
  start: Dayjs;
  end: Dayjs;
}

export interface IPlazaData {
  category: string;
  title?: string;
  date: Dayjs;
  writer: string;
  content: string;
  rest?: restType;
}

export const restSchema: Schema<restType> = new Schema({
  type: {
    type: String,
    enum: ["일반", "특별"],
  },
  start: Dayjs,
  end: Dayjs,
});
export const PlazaSchema: Schema<IPlazaData> = new Schema({
  category: {
    type: String,
    enum: ["건의", "신고", "홍보", "휴식", "충전"],
  },
  title: {
    type: String,
  },
  date: {
    type: Dayjs,
  },
  writer: {
    type: String,
  },
  content: {
    type: String,
  },
  rest: {
    type: restSchema,
  },
});
export const Plaza =
  (mongoose.models.Plaza as Model<IPlazaData, {}, {}, {}>) ||
  model<IPlazaData>("Plaza", PlazaSchema);
