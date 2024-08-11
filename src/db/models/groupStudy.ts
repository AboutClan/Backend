import mongoose, { model, Model, Schema } from "mongoose";
import { IUser } from "./user";

export type GroupStudyStatus ="end"| "pending"

interface ICategory {
  main: string;
  sub: string;
}
export interface subCommentType{
  user: string | IUser;
  comment: string;
}

export interface memberCntType {
  min: number;
  max: number;
}

export interface participantsType {
  user: string | IUser;
  randomId?: number;
  role: UserRole;
  attendCnt: number;
}

interface IWaiting {
  user: string | IUser;
  answer?: string;
  pointType: string;
}

export interface commentType {
  user: string | IUser;
  comment: string;
  subComments?: subCommentType[];
  likeList?: string[];
}

export interface IGroupStudyData {
  title: string;
  category: ICategory;
  challenge?: string;
  rules: string[];
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
  comments: commentType[];
  id: number;
  location: string;
  image?: string;
  isFree: boolean;
  feeText?: string;
  fee?: number;
  questionText?: string;
  hashTag: string;
  attendance: IAttendance;
  link?: string;
  isSecret?: boolean;
  waiting: IWaiting[];
}

type UserRole = "admin" | "manager" | "member"|"outsider";

interface IAttendance {
  firstDate?: string;
  lastWeek: IWeekRecord[];
  thisWeek: IWeekRecord[];
}

interface IWeekRecord {
  uid: string;
  name: string;
  attendRecord: string[];
  attendRecordSub?: string[];
}

export const weekSchema: Schema<IWeekRecord> = new Schema(
  {
    uid: {
      type: String,
    },
    name: {
      type: String,
    },
    attendRecord: {
      type: [String],
    },
    attendRecordSub: {
      type: [String],
    },
  },
  { _id: false }
);

export const attendanceSchema: Schema<IAttendance> = new Schema(
  {
    firstDate: {
      type: String,
    },
    lastWeek: {
      type: [weekSchema],
    },
    thisWeek: { type: [weekSchema] },
  },
  { _id: false }
);

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
      enum: ["admin", "member", "manager", "human","outsider"],
    },
    attendCnt: {
      type: Number,
    },
    randomId: {
      type:Number
    }
  },
  { _id: false }
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
      type:[String],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

export const waitingSchema: Schema<IWaiting> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    answer: {
      type: String,
    },
    pointType: {
      type: String,
    },
  },
  { _id: false }
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
    challenge: {
      type: String,
    },
    feeText: {
      type: String,
    },
    rules: {
      type: [String],
    },
    category: {
      type: categorySchema,
    },
    attendance: {
      type: attendanceSchema,
    },
    hashTag: {
      type: String,
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
    isSecret: {
      type: Boolean,
    },
    questionText: {
      type: String,
    },
    waiting: {
      type: [waitingSchema],
      ref: "User",
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
      enum: ["pending", "open", "close", "end", "gathering"],
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
    comments: {
      type: [commentSchema],
    },
    link: {
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
        "인천",
      ],
    },

    image: {
      type: String,
    },
  },
  { timestamps: true}
);

export const GroupStudy =
  (mongoose.models.GroupStudy as Model<IGroupStudyData, {}, {}, {}>) ||
  model<IGroupStudyData>("GroupStudy", GroupStudySchema);
