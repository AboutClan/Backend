import mongoose, {
  model,
  Model,
  Schema,
  StringExpressionOperatorReturningBoolean,
} from "mongoose";
import { IUser } from "./user";

export type GroupStudyStatus = "pending" | "open" | "close" | "end";

interface ICategory {
  main: string;
  sub: string;
}

export interface memberCntType {
  min: number;
  max: number;
}

export interface participantsType {
  user: string | IUser;
  role: UserRole;
}

export interface commentType {
  user: string | IUser;
  comment: string;
}

export interface IGroupStudyData {
  title: string;
  category: ICategory;
  content: string;
  period: string;
  guide: string;
  gender: boolean;
  age: number[];
  organizer: IUser;
  memberCnt: memberCntType;
  password?: string;
  status: GroupStudyStatus;
  participants: participantsType[];
  user: string | IUser;
  comment: commentType[];
  id: number;
  location: string;
  image?: string;
  isFree: boolean;
  feeText?: string;
  fee?: number;
}

type UserRole = "admin" | "manager" | "member";

export const categorySchema: Schema<ICategory> = new Schema(
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
    role: {
      type: String,
      enum: ["member", "manager", "human"],
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
  }
);

export const GroupStudySchema: Schema<IGroupStudyData> = new Schema(
  {
    title: {
      type: String,
    },
    isFree: {
      type: Boolean,
    },
    fee: {
      type: Number,
    },
    feeText: {
      type: String,
    },
    category: {
      type: categorySchema,
    },
    content: {
      type: String,
    },
    guide: {
      type: String,
    },
    memberCnt: {
      type: memberCntSchema,
    },
    age: {
      type: [Number],
    },

    gender: {
      type: Boolean,
    },
    password: {
      type: String,
    },
    participants: {
      type: [participantsSchema],
      ref: "User",
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "open", "close", "end"],
      default: "pending",
      required: true,
    },
    id: {
      type: Number,
      default: 0,
    },
    period: {
      type: String,
    },
    location: {
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
      ],
    },

    image: {
      type: String,
    },
  },
  { timestamps: true }
);

export const GroupStudy =
  (mongoose.models.GroupStudy as Model<IGroupStudyData, {}, {}, {}>) ||
  model<IGroupStudyData>("GroupStudy", GroupStudySchema);
