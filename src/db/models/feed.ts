import mongoose, { model, Model, Schema } from "mongoose";

import { IUser } from "./user";

export interface commentType {
  user: string | IUser;
  comment: string;
  subComments?: subCommentType[]
  likeList?: string[];
}

export interface subCommentType{
  user: string | IUser;
  comment: string;
  likeList?: string[];
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
  comments: commentType[],
  createdAt:string,
  addLike(userId: string): Promise<void>;
  subCategory: string,
}

export interface likeType {
  like: string | IUser;
 
}

export const subCommentSchema: Schema<subCommentType> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    likeList:{
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

export const commentSchema: Schema<commentType> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    subComments:{
      type: [subCommentSchema],
      default: []
    },
    likeList:{
      type: [String],
      default: []
    }
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
  subCategory: {
    type: String,
  
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
