import mongoose, { Model, Schema } from "mongoose";

export interface IDailyCheck {
  uid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const dailyCheckSchema: Schema<IDailyCheck> = new Schema(
  {
    uid: String,
    name: String,
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

export const DailyCheck =
  (mongoose.models.DailyCheck as Model<IDailyCheck, {}, {}, {}>) ||
  mongoose.model<IDailyCheck>("DailyCheck", dailyCheckSchema);
