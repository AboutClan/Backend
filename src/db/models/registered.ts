import mongoose, { model, Schema, Model, Document } from "mongoose";

export interface IMajor {
  department: string;
  detail: string;
}

export interface IInterest {
  first: string;
  second: string;
}

export interface IRegistered extends Document {
  uid: string;
  name: string;
  location: string;
  mbti?: string;
  gender: string;
  profileImage: string;
  birth: string;

  message: string;
  major: string[];
  interests: IInterest;
  telephone: string;
}

export const InterestSchema: Schema<IInterest> = new Schema(
  {
    first: String,
    second: String,
  },
  { _id: false, timestamps: true, strict: false }
);

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
    type: InterestSchema,
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
  message: {
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
  profileImage: {
    type: String,
    required: true,
  },
});

export const Registered =
  (mongoose.models.REgistered as Model<IRegistered, {}, {}, {}>) ||
  model<IRegistered>("Registered", RegisteredSchema);
