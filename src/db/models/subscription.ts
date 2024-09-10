import mongoose, { model, Schema, Model } from "mongoose";
import {z} from "zod"

export const SubscriptionZodSchema = z.object({
  uid: z.string(),
  token: z.string()
});

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
