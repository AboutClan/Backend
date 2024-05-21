import mongoose, { model, Schema, Model } from "mongoose";

export interface ISubscription {
  uid: string,
  token: string
}

export const SubscriptionSchema: Schema<ISubscription> = new Schema({
  uid:{
    type: String
  },
  token:{
    type: String
  }
});

export const Subscription =
  (mongoose.models.ISubscription as Model<ISubscription, {}, {}, {}>) ||
  model<ISubscription>("Subscription", SubscriptionSchema);
