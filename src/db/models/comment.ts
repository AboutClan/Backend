import mongoose, { Model, model, Schema } from "mongoose";

interface Comment {
  user: string;
  comment: string;
}

export const CommentSchema: Schema<Comment> = new Schema(
  {
    user: {
      type: String,
      ref: "User",
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Comment =
  (mongoose.models.Comment as Model<Comment>) ||
  model("Comment", CommentSchema);
