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
  status?: string;
}

const noticeSchema: Schema<INotice> = new Schema(
  {
    from: String,
    to: String,
    type: {
      type: String,
      enum: ["like", "friend"],
    },
    message: String,
    status: {
      type: String,
      enum: ["pending", "refusal", "approval"],
    },
  },
  { timestamps: true }
);

export const Notice =
  (mongoose.models.Notice as Model<INotice, {}, {}, {}>) ||
  mongoose.model<INotice>("Notice", noticeSchema);
