import mongoose, { model, Model, Schema } from "mongoose";
import { IUser } from "./user";

export type gatherStatus = "pending" | "open" | "close" | "end";

export interface ITime {
  hours?: number;
  minutes?: number;
}



export interface TitleType {
  title: string;
  subtitle?: string;
}
export interface LocationType {
  main: string;
  sub?: string;
}

export interface memberCntType {
  min: number;
  max: number;
}

export interface GatherType {
  text: string;
  time: ITime;
}

export interface participantsType {
  user: string | IUser;
  phase: string;
}

export interface subCommentType{
  user: string | IUser;
  comment: string;
  likeList?: string[];
}

export interface commentType {
  user: string | IUser;
  comment: string;
  subComments?: subCommentType[];
  likeList?: string[];
}

export interface IGatherData {
  title: string;
  type: TitleType;
  gatherList: GatherType[];
  content: string;
  location: LocationType;
  memberCnt: memberCntType;
  age?: number[];
  preCnt?: number;
  genderCondition: boolean;
  password?: string;
  status: gatherStatus;
  participants: participantsType[];
  user: string | IUser;
  comments: commentType[];
  id: number;
  date: string;
  place?: string;
  isAdminOpen?: boolean;
  image?: string;
  kakaoUrl?: string;
}

export const typeSchema: Schema<TitleType> = new Schema(
  {
    title: {
      type: String,
    },
    subtitle: {
      type: String,
      required: false,
      default: null,
    },
  },
  { _id: false, timestamps: false },
);

export const timeSchema: Schema<ITime> = new Schema(
  {
    hours: {
      type: Number,
    },
    minutes: {
      type: Number,
    },
  },
  { _id: false , timestamps: false}
);

export const gatherListSchema: Schema<GatherType> = new Schema(
  {
    text: {
      type: String,
    },
    time: {
      type: timeSchema,
    },
  },
  { _id: false , timestamps: false}
);

export const locationSchema: Schema<LocationType> = new Schema(
  {
    main: {
      type: String,
    },
    sub: {
      type: String,
      default: "",
    },
  },
  { _id: false , timestamps: false}
);

export const memberCntSchema: Schema<memberCntType> = new Schema(
  {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
  },
  { _id: false , timestamps: false}
);

export const participantsSchema: Schema<participantsType> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    phase: {
      type: String,
      enum: ["all", "first", "second"],
    },
  },
  { _id: false , timestamps: false}
);

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

export const GatherSchema: Schema<IGatherData> = new Schema(
  {
    title: {
      type: String,
    },
    gatherList: {
      type: [gatherListSchema],
    },
    type: {
      type: typeSchema,
    },
    content: {
      type: String,
    },
    location: {
      type: locationSchema,
    },
    memberCnt: {
      type: memberCntSchema,
    },
    age: {
      type: [Number],
    },
    preCnt: {
      type: Number,
    },
    genderCondition: {
      type: Boolean,
    },
    password: {
      type: String,
    },
    participants: {
      type: [participantsSchema],
      ref: "User",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "open", "close", "end"],
      default: "pending",
      required: true,
    },
    comments: {
      type: [commentSchema],
    },
    id: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
    },
    place: {
      type: String,
      enum: [
        "수원",
        "양천",
        "안양",
        "강남",
        "동대문",
        "전체",
        "수원/안양",
        "양천/강남",
        "인천",
      ],
    },
    isAdminOpen: {
      type: Boolean,
    },
    image: {
      type: String,
    },
    kakaoUrl: {
      type: String,
    },
  },
  { timestamps: true, strict: false }
);

export const Gather =
  (mongoose.models.Gather as Model<IGatherData, {}, {}, {}>) ||
  model<IGatherData>("Gather", GatherSchema);
