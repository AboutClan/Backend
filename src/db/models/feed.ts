import mongoose, { model, Model, Schema } from "mongoose";

import { IUser } from "./user";

export interface commentType {
  user: string | IUser;
  comment: string;
}

export interface IFeed {
  title: string,
  text: string,
  images: string[],
  writer: string | IUser,
  type: string,
  typeId: string,
  isAnonymous?:boolean
  like: string[] | IUser[],
  comments: [commentType],
  addLike(userId: string): Promise<void>;
}

export interface likeType {
  like: string | IUser;
 
}

export const commentSchema: Schema<commentType> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const likeSchema: Schema<likeType> = new Schema(
  {
    like: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

export const FeedSchema: Schema<IFeed> = new Schema({
  title:{
    type: String
  },
  text:{
    type: String
  },
  images:{
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
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  comments:{
    type: [commentSchema],
    default: []
  },
  like:[
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
}, {  timestamps: true});

FeedSchema.methods.addLike = async function (userId: string) {
  const index = this.like.indexOf(userId);
  if (index === -1) {
    this.like.push(userId);
    await this.save();
    return true;
  } else {
    this.like.splice(index, 1); // Remove userId from the array
    await this.save();
    return false;
  }

};

export const Feed =
  (mongoose.models.Feed as Model<IFeed, {}, {}, {}>) ||
  model<IFeed>("Feed", FeedSchema);
