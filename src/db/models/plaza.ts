import mongoose, { model, Model, Schema } from "mongoose";

interface IVoteList {
  voteListIdx: number;
  value: string;
}

export interface IPlazaData {
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

export const PlazaSchema: Schema<IPlazaData> = new Schema({
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
export const Plaza =
  (mongoose.models.Plaza as Model<IPlazaData, {}, {}, {}>) ||
  model<IPlazaData>("Plaza", PlazaSchema);
