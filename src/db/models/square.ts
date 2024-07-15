import mongoose, { model, Model, Schema } from "mongoose";

interface IVoteList {
  voteListIdx: number;
  value: string;
}

export interface ISquareData {
  category: string;
  title: string;
  content: string;
  voteList?: IVoteList[];
  id?: string;
  writer: string;
  date?: string;
  deadline?: any;
  suggestContent?: any;
}

export const SquareSchema: Schema<ISquareData> = new Schema({
  category: {
    type: String,
  },
  writer: {
    type: String,
  },
  deadline: {
    type: String,
  },
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  suggestContent: {
    type: String,
  },
  voteList: {
    // type: [{}],
  },
});
export const Square =
  (mongoose.models.Square as Model<ISquareData, {}, {}, {}>) ||
  model<ISquareData>("Square", SquareSchema);
