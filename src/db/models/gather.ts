import mongoose, { model, Model, Schema } from "mongoose";
import { IUser } from "./user";

export type gatherStatus = "pending" | "open" | "close" | "end";

export interface ITime {
  hour?: number;
  minute?: number;
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

export interface commentType {
  user: string | IUser;
  comment: string;
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
  comment: commentType[];
  id: number;
}

export const typeSchema: Schema<TitleType> = new Schema(
  {
    title: {
      type: String,
    },
    subtitle: {
      type: String,
    },
  },
  { _id: false }
);

export const timeSchema: Schema<ITime> = new Schema(
  {
    hour: {
      type: Number,
    },
    minute: {
      type: Number,
    },
  },
  { _id: false }
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
  { _id: false }
);

export const locationSchema: Schema<LocationType> = new Schema(
  {
    main: {
      type: String,
    },
    sub: {
      type: String,
    },
  },
  { _id: false }
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
  { _id: false }
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
  { _id: false }
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
  },
  {
    timestamps: true,
    _id: false,
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
    comment: {
      type: [commentSchema],
    },
    id: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Gather =
  (mongoose.models.Gather as Model<IGatherData, {}, {}, {}>) ||
  model<IGatherData>("Gather", GatherSchema);
