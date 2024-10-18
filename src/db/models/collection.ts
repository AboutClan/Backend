import mongoose, {
  Model,
  Schema
} from "mongoose";
import { z } from "zod";
import { IUser } from "./user";

export const CollectionZodSchema = z.object({
  user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  type: z.enum(["alphabet"]).default("alphabet"),
  collects:  z.array(z.string()),
  collectCnt: z.number(),
})

export interface ICollection {
  user: string | IUser;
  type: string;
  collects: string[];
  stamps:number
  collectCnt: number;
}

const colectionSchema: Schema<ICollection> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["alphabet"],
    },
    stamps:{
      type: Number,
      default:0,
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
