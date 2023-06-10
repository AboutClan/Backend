import { Dayjs } from "dayjs";
import mongoose, { model, Model, Schema } from "mongoose";

export interface GatherType {
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

export interface IGatherData {
  type: GatherType;
  title: string;
  content: string;
  location: LocationType;
  date: Dayjs;
  memberCnt: memberCntType;
  age?: number[];
  preCnt?: number;
  genderCondition: boolean;
  password?: string;
  id: number;
}

export const typeSchema: Schema<GatherType> = new Schema({
  title: {
    type: String,
  },
  subtitle: {
    type: String,
  },
});

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

export const GatherSchema: Schema<IGatherData> = new Schema(
  {
    type: {
      type: typeSchema,
    },
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    location: {
      type: locationSchema,
    },
    date: {
      type: Date,
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
    id: {
      type: Number,
    },
  },
  { timestamps: true }
);
export const Gather =
  (mongoose.models.Gather as Model<IGatherData, {}, {}, {}>) ||
  model<IGatherData>("Gather", GatherSchema);
