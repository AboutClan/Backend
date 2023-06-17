import mongoose, { model, Schema, Model, Document } from "mongoose";

export interface IPlace extends Document {
  status: string;
  fullname: string;
  brand?: string;
  branch?: string;
  image?: string;
  latitude: number;
  longitude: number;
  priority?: number;
  _id: string;
  location: string;
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
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  priority: Number,
  location: {
    type: String,
    enum: ["수원", "양천"],
    default: "수원",
  },
});

export const Place =
  (mongoose.models.Place as Model<IPlace, {}, {}, {}>) ||
  model<IPlace>("Place", PlaceSchema);
