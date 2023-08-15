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
  location: string;
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

export const RequestSchema: Schema<IRequestData> = new Schema(
  {
    category: {
      type: String,
      enum: ["건의", "홍보", "휴식", "충전", "탈퇴","출석","배지"],
    },
    title: {
      type: String,
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
    location: {
      type: String,
      enum: ["수원", "양천", "안양"],
      default: "수원",
    },
  },
  {
    timestamps: true,
  }
);
export const Request =
  (mongoose.models.Request as Model<IRequestData, {}, {}, {}>) ||
  model<IRequestData>("Request", RequestSchema);
