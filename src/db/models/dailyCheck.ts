import mongoose, {
  Model,
  Schema,
  StringExpressionOperatorReturningBoolean,
} from "mongoose";

export interface IDailyCheck {
  uid: string;
  name: string;
}

const dailyCheckSchema: Schema<IDailyCheck> = new Schema(
  {
    uid: String,
    name: String,
  },
  { timestamps: true }
);

export const DailyCheck =
  (mongoose.models.DailyCheck as Model<IDailyCheck, {}, {}, {}>) ||
  mongoose.model<IDailyCheck>("DailyCheck", dailyCheckSchema);
