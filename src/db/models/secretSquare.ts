import mongoose, { model, Model, Schema, Types } from "mongoose";
import { SecretSquarePoll } from "./secretSquarePoll";

type Category = "일상" | "고민" | "정보" | "같이해요";

type SecretSquareType = "general" | "poll";

export interface SecretSquareItem {
  category: Category;
  title: string;
  content: string;
  type: SecretSquareType;
  pollId: Types.ObjectId;
  canMultiple: boolean;
  author: {
    uid: string;
    name: string;
  };
  viewCount: number;
}

export const secretSquareSchema = new Schema<SecretSquareItem>(
  {
    category: {
      type: String,
    },
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    type: {
      type: String,
    },
    pollId: {
      type: Schema.Types.ObjectId,
      ref: SecretSquarePoll,
    },
    canMultiple: {
      type: Boolean,
    },
    author: {
      uid: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String, ref: "User" },
    },
    viewCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export const SecretSquare =
  (mongoose.models.Square as Model<SecretSquareItem>) ||
  model<SecretSquareItem>("SecretSquare", secretSquareSchema);
