import mongoose, { model, Model, Schema, Types } from "mongoose";
interface Comment {
  user: string;
  comment: string;
  squareId: Types.ObjectId;
}

export const CommentSchema: Schema<Comment> = new Schema(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    squareId: {
      type: Schema.Types.ObjectId,
      ref: "SecretSquare",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Comment =
  (mongoose.models.Comment as Model<Comment>) ||
  model("Comment", CommentSchema);
