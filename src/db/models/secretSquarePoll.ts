import { model, Schema, Types } from "mongoose";

interface PollItem {
  name: string;
  users: Types.ObjectId[]
}

const pollItemSchema = new Schema<PollItem>({
  name: {
    type: String,
  },
  users: {
    type: [Schema.Types.ObjectId],
    ref: "User",
  },
});

export const PollSchema = new Schema({
  squareId: {
    type: String,
    ref: "SecretSquare",
  },
  pollItems: [pollItemSchema],
});

export const Poll = model("Poll", PollSchema);
