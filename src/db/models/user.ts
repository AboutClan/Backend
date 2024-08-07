import mongoose, { Document, model, Model, Schema } from "mongoose";
import { IPlace } from "./place";
import { InterestSchema, IRegistered, MajorSchema } from "./registered";

export interface restType {
  type: string;
  startDate: Date;
  endDate: Date;
  content: string;
  restCnt: number;
  cumulativeSum: number;
}

export interface avatarType {
  type: number;
  bg: number;
}

export interface preferenceType {
  place: string | IPlace;
  subPlace: string[] | IPlace[];
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
  deposit: number;
  studyPreference: preferenceType;
  friend: string[];
  like: number;
  belong?: string;
  monthScore: number;
  isPrivate?: boolean;
  instagram?:string
}

export const restSchema: Schema<restType> = new Schema({
  type: Schema.Types.String,
  startDate: Schema.Types.Date,
  endDate: Schema.Types.Date,
  content: Schema.Types.String,
  restCnt: {
    type: Schema.Types.Number,
    default: 0,
  },
  cumulativeSum: {
    type: Schema.Types.Number,
    default: 0,
  },
}, {timestamps:false});

export const avatarSchema: Schema<avatarType> = new Schema({
  type: {
    type: Schema.Types.Number,
    default: 1,
  },
  bg: {
    type: Schema.Types.Number,
    default: 1,
  },
}, {timestamps:false});

//Todo: Error
export const preferenceSchema: Schema<preferenceType> = new Schema(
  {
    subPlace: {
      type: [Schema.Types.ObjectId],
      ref: "Place",
    },
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
    },
  },
  {
    _id: false,
    timestamps: false
  }
);

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
    enum: ["수원", "양천", "안양", "강남", "동대문", "인천"],
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
  belong: {
    type: String,
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
  isPrivate: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: [
      "noMember",
      "waiting",
      "human",
      "member",
      "manager",
      "previliged",
      "resting",
      "enthusiastic",
    ],
    default: "member",
  },
  score: {
    type: Number,
    default: 0,
  },
  monthScore:{
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
  majors: {
    type: [MajorSchema],
    default: [],
  },
  interests: {
    type: InterestSchema,
    default: { first: "", second: "" },
  },
  telephone: {
    type: String,
    default: "",
  },
  deposit: {
    type: Number,
    default: 3000,
  },
  friend: {
    type: [String],
    default: [],
  },
  like: {
    type: Number,
    default: 0,
  },
  instagram: {
    type: String,
    default: "",
  },
  studyPreference: {
    type: preferenceSchema,
  },
});

export const User =
  (mongoose.models.User as Model<IUser, {}, {}, {}>) ||
  model<IUser>("User", UserSchema);
