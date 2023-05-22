import mongoose, { model, Schema, Model, Document } from "mongoose";
import { IRegistered, InterestSchema } from "./registered";

export interface restType {
  type: string;
  startDate: Date;
  endDate: Date;
  content: string;
}

export interface avatarType {
  type: number;
  bg: number;
}

export interface IUser extends Document, IRegistered {
  registerDate: string;
  isActive?: boolean;
  point: number;
  role?: string;
  score: number;
  comment: string;
  rest: restType;
  avatar: avatarType;
}

export const restSchema: Schema<restType> = new Schema({
  type: Schema.Types.String,
  startDate: Schema.Types.Date,
  endDate: Schema.Types.Date,
  content: Schema.Types.String,
});

export const avatarSchema: Schema<avatarType> = new Schema({
  type: {
    type: Schema.Types.Number,
    default: 1,
  },
  bg: {
    type: Schema.Types.Number,
    default: 1,
  },
});

export const UserSchema: Schema<IUser> = new Schema({
  uid: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    enum: ["수원", "양천", "안양"],
    default: "수원",
  },
  mbti: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default:
      "https://user-images.githubusercontent.com/48513798/173180642-8fc5948e-a437-45f3-91d0-3f0098a38195.png",
  },
  registerDate: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  birth: {
    type: String,
    default: "",
  },
  role: String,
  score: {
    type: Number,
    default: 0,
  },
  point: {
    type: Number,
    default: 0,
  },
  comment: {
    type: String,
    default: "안녕하세요! 잘 부탁드립니다~!",
  },
  rest: restSchema,
  avatar: avatarSchema,
  message: {
    type: String,
    default: "",
  },
  major: {
    type: [String],
  },
  interests: {
    type: InterestSchema,
  },
  telephone: {
    type: String,
    default: "",
  },
});

export const User =
  (mongoose.models.User as Model<IUser, {}, {}, {}>) ||
  model<IUser>("User", UserSchema);
