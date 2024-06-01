import mongoose, { model, Schema, Document, Model } from "mongoose";
import { IUser } from "./user";

export interface INotificationSub extends Document {
  endpoint: string,
  keys: KeyType,
  uid: string
}
export interface KeyType extends Document {
      p256dh: string,
      auth: string
  }  

const KeySchema: Schema<KeyType> = new Schema({
    p256dh: {
        type: String,
    },
    auth:{ type: String}
})

export const NotificationSubSchema: Schema<INotificationSub> = new Schema({
    endpoint: {
        type: String
    },
    keys: KeySchema,
    uid: {
        type: String
    }
});

export const NotificationSub =
  (mongoose.models.NotificationSub as Model<INotificationSub, {}, {}, {}>) ||
  model<INotificationSub>("NotificationSub", NotificationSubSchema);
