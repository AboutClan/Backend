import mongoose, { model, Model, Schema } from "mongoose";

type Category = "일상" | "고민" | "정보" | "같이해요";

type SecretSquareType = "general" | "poll";

interface PollItem {
  id: number;
  name: string;
  count: number;
}

export interface ISecretSquareItem {
  category: Category;
  title: string;
  content: string;
  type: SecretSquareType;
  pollList: PollItem[];
  canMultiple: boolean;
  author: {
    uid: string;
    name: string;
  };
  viewCount: number;
}

const PollSchema: Schema<PollItem> = new Schema({
  id: {
    type: Number,
  },
  name: {
    type: String,
  },
  count: {
    type: Number,
  },
});

export const SecretSquareSchema: Schema<ISecretSquareItem> = new Schema(
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
    pollList: {
      type: [PollSchema],
    },
    canMultiple: {
      type: Boolean,
    },
    author: {
      uid: { type: String, ref: "User" },
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
  (mongoose.models.Square as Model<ISecretSquareItem>) ||
  model<ISecretSquareItem>("Square", SecretSquareSchema);
