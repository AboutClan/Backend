import mongoose, { model, Model, Schema } from "mongoose";

type Category = "일상" | "고민" | "정보" | "같이해요";

type SquareType = "general" | "poll";

interface PollItem {
  id: number;
  name: string;
  count: number;
}

export interface ISquareItem {
  category: Category;
  title: string;
  content: string;
  type: SquareType;
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

export const SquareSchema: Schema<ISquareItem> = new Schema(
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

export const Square =
  (mongoose.models.Square as Model<ISquareItem>) ||
  model<ISquareItem>("Square", SquareSchema);
