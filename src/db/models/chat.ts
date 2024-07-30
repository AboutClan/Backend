import mongoose, { model, Model, Schema } from "mongoose";

export interface IContent{
    userId: String;
    content: string
    createdAt: string;
    _id: string;
}

export interface IChat {
  user1: String;
  user2: String;
  status: string;
    contents: IContent[];
}

const ContentSchema :Schema<IContent> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        require: true,
        ref: "User"
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    user2: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
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
