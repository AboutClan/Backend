import mongoose, { model, Schema, Model } from "mongoose";

export interface IFcmToken {
  uid: string,
  devices: IDevice[]
}

export interface IDevice {
    platform: string,
    token: string,
  }

const deviceSchema:Schema<IDevice> = new Schema({
    platform: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
})

export const FcmTokenSchema: Schema<IFcmToken> = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  devices: [deviceSchema]
});

export const FcmToken =
  (mongoose.models.FcmToken as Model<IFcmToken, {}, {}, {}>) ||
  model<IFcmToken>("FcmToken", FcmTokenSchema);
