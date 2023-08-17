import mongoose, {
  Model,
  Schema,
  StringExpressionOperatorReturningBoolean,
} from "mongoose";

export interface INotice {
  from: string;
  to: string;
  type: string;
  message: string;
}

const noticeSchema: Schema<INotice> = new Schema({
  from: String,
  to: String,
  type: {
    type: String,
    enum: ["like"],
  },
  message: String,
});

export const Notice =
  (mongoose.models.Notice as Model<INotice, {}, {}, {}>) ||
  mongoose.model<INotice>("Notice", noticeSchema);
