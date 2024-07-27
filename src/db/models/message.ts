import mongoose, { model, Schema, Model } from "mongoose";

export interface IContent{
    uid: string;
    content: string
}

export interface IMessage {
  fromUid: string;
  toUid: string;
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

export const MessageSchema: Schema<IMessage> = new Schema({
    fromUid: {
        type: String,
        required: true
    },
    toUid: {
        type: String,
        required: true
    },
    contents: {
        type: [ContentSchema],
        required: true
    }
});

export const Message =
  (mongoose.models.Message as Model<IMessage, {}, {}, {}>) ||
  model<IMessage>("Message", MessageSchema);
