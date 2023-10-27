import mongoose, {
  Model,
  Schema,
  StringExpressionOperatorReturningBoolean,
} from "mongoose";

export interface ICollection {
  uid: string;
  name: string;
  type: string;
  collects: string[];
  collectCnt: number;
}

const colectionSchema: Schema<ICollection> = new Schema(
  {
    uid: String,
    name: String,
    type: {
      type: String,
      enum: ["alphabet"],
    },
    collects: {
      type: [String],
    },
    collectCnt: Number,
  },
  { timestamps: true }
);

export const Collection =
  (mongoose.models.Collection as Model<ICollection, {}, {}, {}>) ||
  mongoose.model<ICollection>("collection", colectionSchema);
