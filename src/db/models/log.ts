import mongoose, { model, Schema, Model } from "mongoose";

export interface ILog {
  timeStamp: Date;
  level: string;
  message: string;
  meta: { type: string; uid: number; value: number; sub?: string };
}

const metaSchema = new Schema({
  type: String,
  uid: Number,
  value: Number,
  sub: String,
});

export const LogSchema: Schema<ILog> = new Schema({
  timeStamp: Date,
  level: String,
  message: String,
  meta: {
    type: metaSchema,
    enum: ["score", "point", "deposit"],
  },
});

export const Log =
  (mongoose.models.Log as Model<ILog, {}, {}, {}>) ||
  model<ILog>("Log", LogSchema);
