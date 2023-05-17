import mongoose, { Model, Schema, model } from "mongoose";
import { Dayjs } from "dayjs";

export interface IStoreGift {
  image: string;
  name: string;
  brand: string;
  point: number;
  winner: number;
  date: { startDay: Dayjs; endDay: Dayjs };
  giftId?: number;
  max?: number;
}

export interface IStoreApplicant {
  uid: string;
  name: string;
  cnt: number;
  giftId?: number;
}

const giftSchema: Schema = new Schema(
  {
    uid: { type: String, ref: "User" },
    name: { type: String, ref: "User" },
    cnt: { type: Number, default: 0 },
    giftId: { type: Number },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.createdAt;
        delete ret.upadtedAt;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const GiftModel =
  (mongoose.models.GiftModel as Model<IStoreApplicant, {}, {}, {}>) ||
  mongoose.model<IStoreApplicant>("GiftModel", giftSchema);
