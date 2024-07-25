import mongoose, { model, Model, Schema, Types } from "mongoose";

export type SecretSquareCategory = "일상" | "고민" | "정보" | "같이해요";

export type SecretSquareType = "general" | "poll";

// TODO add fields (likeCount, images)
interface SecretSquareItem {
  category: SecretSquareCategory;
  title: string;
  content: string;
  type: SecretSquareType;
  poll: {
    pollItems: PollItem[];
    canMultiple: boolean;
  };
  author: Types.ObjectId;
  viewCount: number;
}

interface PollItem {
  name: string;
  users: Types.ObjectId[];
}

const pollItemSchema = new Schema<PollItem>({
  name: {
    type: String,
    required: true,
  },
  users: {
    type: [Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
});

const pollSchema = new Schema({
  pollItems: {
    type: [pollItemSchema],
    required: true,
  },
  canMultiple: {
    type: Boolean,
    required: true,
  },
});

export const secretSquareSchema = new Schema<SecretSquareItem>(
  {
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    poll: {
      type: pollSchema,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const SecretSquare =
  (mongoose.models.Square as Model<SecretSquareItem>) ||
  model<SecretSquareItem>("SecretSquare", secretSquareSchema);
