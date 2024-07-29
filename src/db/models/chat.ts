import mongoose, { model, Model, Schema } from "mongoose";

export interface IContent{
    uid: string;
    content: string
    createdAt: string;
}

export interface IChat {
  user1: string;
  user2: string;
  status: string;
    contents: IContent[];
}

const ContentSchema :Schema<IContent> = new Schema({
    uid:{
        type:String,
        require: true
    },
    
    content:{
        type:String,
        require: true
    }
}, {
    timestamps: true
})

export const ChatSchema: Schema<IChat> = new Schema({
    user1: {
        type: String,
        required: true
    },
    user2: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "normal"
    },
    contents: {
        type: [ContentSchema],
        default: [],
        required: true
    }
});

export const Chat =
  (mongoose.models.Chat as Model<IChat, {}, {}, {}>) ||
  model<IChat>("Chat", ChatSchema);
