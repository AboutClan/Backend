import mongoose, { model, Schema, Model, Document } from "mongoose";

export interface IMajor {
  department: string;
  detail: string;
}

export interface IRegistered extends Document {
  uid: string;
  name: string;
  major: string[];
  interests: { first: string; second: string };
  telephone: string;
  location: string;
  mbti?: string;
  gender: string;
  profileImg: string;
}

export const RegisteredSchema: Schema<IRegistered> = new Schema({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  major: {
    type: [String],
    required: true,
  },
  interests: {
    type: { first: String, second: String },
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  mbti: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  profileImg: {
    type: String,
    required: true,
  },
});

export const Registered =
  (mongoose.models.REgistered as Model<IRegistered, {}, {}, {}>) ||
  model<IRegistered>("Registered", RegisteredSchema);
