import mongoose, { model, Schema, Document, Model } from "mongoose";
import { IUser } from "./user";
import { IPlace } from "./place";

export interface IAttendence extends Document {
  date: Date;
  participants: IParticipant[];
  meetingTime: string;
  meetingPlace: string | IPlace;
  process: string;
  firstChoice?: boolean;
}

export interface IParticipant {
  user: string | IUser;
  time?: string;
  place?: string | IPlace;
}

const ParticipantSchema: Schema<IParticipant> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    time: String,
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
    },
  },
  { _id: false }
);
export const AttendenceSchema: Schema<IAttendence> = new Schema(
  {
    date: Date,
    participants: [ParticipantSchema],
    meetingTime: {
      type: String,
      default: "",
    },
    meetingPlace: {
      type: Schema.Types.ObjectId,
      ref: "Place",
    },
    process: {
      type: String,
      enum: ["pending", "dismiss", "open"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
export const Attendence =
  (mongoose.models.Attendence as Model<IAttendence, {}, {}, {}>) ||
  model<IAttendence>("Attendence", AttendenceSchema);
