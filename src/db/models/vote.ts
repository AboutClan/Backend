import { Dayjs } from "dayjs";
import mongoose, { model, Schema, Model, Document } from "mongoose";
import { IPlace } from "./place";
import { IUser } from "./user";

export interface ITimeStartToEndHM {
  start?: {
    hour?: number;
    minutes?: number;
  };
  end?: {
    hour?: number;
    minutes?: number;
  };
}

export interface IPlaceStatus {
  status?: "pending" | "waiting_confirm" | "open" | "dismissed";
}

export interface IParticipation extends IPlaceStatus, ITimeStartToEndHM {
  place?: IPlace;
  attendances?: IAttendance[];
  absences?: IAbsence[];
  startTime?: Date;
  endTime?: Date;
}

export interface ITimeStartToEnd {
  start?: Dayjs;
  end?: Dayjs;
}

export interface IVote extends Document {
  date: Date;
  participations: IParticipation[];
}

export interface IAttendance {
  user: string | IUser;
  time: ITimeStartToEnd;
  created: Date;
  arrived?: Date;
  firstChoice: boolean;
  confirmed: boolean;
  memo: string;
}

export interface IAbsence {
  user: string | IUser;
  noShow: boolean;
  message: string;
}

const ParticipantTimeSchema: Schema<ITimeStartToEnd> = new Schema(
  {
    start: {
      type: Date,
      required: false,
    },
    end: {
      type: Date,
      required: false,
    },
  },
  { _id: false }
);

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    time: ParticipantTimeSchema,

    arrived: Date,

    firstChoice: {
      type: Schema.Types.Boolean,
      default: true,
    },
    memo: String,
  },
  { _id: false, timestamps: true, strict: false }
);

const AbsenceSchema: Schema<IAbsence> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    noShow: {
      type: Schema.Types.Boolean,
      default: false,
    },
    message: Schema.Types.String,
  },
  { _id: false, timestamps: true }
);

const ParticipationSchema: Schema<IParticipation> = new Schema(
  {
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
    },

    attendances: [AttendanceSchema],
    absences: [AbsenceSchema],
    startTime: Date,
    endTime: Date,

    status: {
      type: Schema.Types.String,
      enum: ["pending", "waiting_confirm", "open", "dismissed"],
      default: "pending",
    },
  },
  { _id: false }
);

const VoteSchema: Schema<IVote> = new Schema({
  date: Date,
  participations: [ParticipationSchema],
});

export const Vote =
  (mongoose.models.Vote as Model<IVote, {}, {}, {}>) ||
  model<IVote>("Vote", VoteSchema);
