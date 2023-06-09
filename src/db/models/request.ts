import { Dayjs } from "dayjs";
import mongoose, { model, Model, Schema } from "mongoose";

export interface restType {
  type: string;
  start: Dayjs;
  end: Dayjs;
}

export interface IRequestData {
  category: string;
  title?: string;

  date: Dayjs;
  writer: string;
  content: string;
  rest?: restType;
}

export const restSchema: Schema<restType> = new Schema(
  {
    type: {
      type: String,
      enum: ["일반", "특별"],
    },
    start: Date,
    end: Date,
  },
  { _id: false }
);

export const RequestSchema: Schema<IRequestData> = new Schema({
  category: {
    type: String,
    enum: ["건의", "신고", "홍보", "휴식", "충전"],
  },
  title: {
    type: String,
  },
  date: {
    type: Date,
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
export const Request =
  (mongoose.models.Request as Model<IRequestData, {}, {}, {}>) ||
  model<IRequestData>("Request", RequestSchema);
