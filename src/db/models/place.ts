import mongoose, { Document, model, Model, Schema } from "mongoose";

export interface IPlace extends Document {
  status: string;
  fullname: string;
  brand?: string;
  branch?: string;
  image?: string;
  coverImage?: string;
  latitude: number;
  longitude: number;
  priority?: number;
  _id: string;
  location: string;
  locationDetail?: string;
  time?: string;
}

export const PlaceSchema: Schema<IPlace> = new Schema({
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  fullname: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  branch: String,
  image: String,
  coverImage: String,

  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  locationDetail: {
    type: String,
  },
  time: {
    type: String,
  },
  priority: Number,
  location: {
    type: String,
    enum: ["수원", "양천", "강남", "동대문", "안양", "인천", "전체"],
    default: "수원",
  },
});

export const Place =
  (mongoose.models.Place as Model<IPlace, {}, {}, {}>) ||
  model<IPlace>("Place", PlaceSchema);
