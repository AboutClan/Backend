import mongoose, { Document, Model, ObjectId, Schema } from "mongoose";
import { z } from "zod";
import { IUser } from "./user";


const PlaceSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  text: z.string(),
 
});

const TimeSchema = z.object({
  start: z.string(), // ISO Date String
  end: z.string(),   // ISO Date String
});

export const RealtimeUserZodSchema = z.object({
  user: z.custom<Schema.Types.ObjectId>(),
  place: PlaceSchema,
  arrived: z.date().optional(),  // ISO Date String
  image: z.custom<Buffer[]>().optional(),
  memo: z.string().optional(),
  comment: z.string().optional(),
  status: z.enum(["pending", "solo", "open", "completed"]),
  time: TimeSchema,
});

export const RealtimeAttZodSchema = z.object({
  image: z.custom<Buffer[]>(),
  memo: z.string().optional(),
  status: z.enum(["pending", "solo", "open", "completed"]),
});


export interface IPlace{
  lat: number;
  lon: number;
  text: string;
 
}

export interface ITime{
  start: string;
  end: string;
}

export interface IRealtimeUser {
  user: ObjectId|IUser;
  place: IPlace;
  arrived?: Date;
  image?: string[] | Buffer[];
  memo?: string;
  comment?: string;
  status: "pending" | "solo" | "open" | "completed";
  time: ITime;
}

export interface IRealtime extends Document {
    date: Date,
    userList?: IRealtimeUser[]
  }

const placeSchema: Schema<IPlace> = new Schema({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  text: { type: String, required: true },

});

const timeSchema: Schema<ITime> = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const realtimeUserSchema: Schema<IRealtimeUser> = new Schema({
  user: { type: Schema.Types.ObjectId,ref:"User", required: true },
  place: { type: placeSchema, required: true },
  arrived: { type: Date },
  image: { type: [String] },
  memo: { type: String },
  comment: { type: String },
  status: { type: String, enum: ["pending", "solo", "open", "completed"], required: true },
  time: { type: timeSchema, required: true },
});

const realtimeSchema: Schema<IRealtime> = new Schema({
    date: Date,
    userList: {
        type: [realtimeUserSchema],
        default: []
    }
  });

export const RealtimeModel: Model<IRealtime> =
  mongoose.models.Realtime || mongoose.model<IRealtime>("Realtime", realtimeSchema);