import mongoose, { model, Schema, Model } from "mongoose";

export interface IFeed {
  title: string,
  text: string,
  imageUrl: string[],
  writer: string,
  type: string
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
    type: String
  },
  type:{
    type: String
  },
});

export const Feed =
  (mongoose.models.Feed as Model<IFeed, {}, {}, {}>) ||
  model<IFeed>("Feed", FeedSchema);
