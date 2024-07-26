import mongoose, { model, Model, Schema } from "mongoose";
import { IUser } from "./user";

export interface IFeed {
  title: string,
  text: string,
  imageUrl: string[],
  writer: string | IUser,
  type: string,
  typeId: string,
  like: string[],
  addLike(userId: string): Promise<void>;
}


export const FeedSchema: Schema<IFeed> = new Schema({
  title:{
    type: String
  },
  text:{
    type: String
  },
  imageUrl:{
    type: [String]
  },
  writer:{
      type: Schema.Types.ObjectId,
      ref: "User",
  },
  type:{
    type: String
  },
  typeId:{
    type: String
  },
  like:{
    type: [String],
    default: []
  },
}, {  timestamps: true});

FeedSchema.methods.addLike = async function (userId: string) {
  const index = this.like.indexOf(userId);
  if (index === -1) {
    this.like.push(userId);
  } else {
    this.like.splice(index, 1); // Remove userId from the array
  }
  await this.save();
};

export const Feed =
  (mongoose.models.Feed as Model<IFeed, {}, {}, {}>) ||
  model<IFeed>("Feed", FeedSchema);
