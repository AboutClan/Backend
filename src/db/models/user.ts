import mongoose, { model, Schema, Model, Document } from "mongoose";

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

export interface IUser extends Document {
  uid: string;
  registerDate: string;
  isActive?: boolean;
  birth: string;
  mbti: string;
  gender: string;
  name: string;
  point: number;
  profileImage: string;
  role?: string;
  score: number;
  comment: string;
  rest: restType;
  location: string;
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
  location: {
    type: String,
    enum: ["수원", "양천"],
    default: "수원",
  },
  avatar: avatarSchema,
});

export const User =
  (mongoose.models.User as Model<IUser, {}, {}, {}>) ||
  model<IUser>("User", UserSchema);
