import mongoose, { Model, Schema } from "mongoose";

export interface IPromotion {
  name: string;
  lastDate: Date;
  uid: string;
}

const promotionSchema: Schema<IPromotion> = new Schema({
  name: String,
  lastDate: Date,
  uid: String,
});

export const Promotion =
  (mongoose.models.Promotion as Model<IPromotion, {}, {}, {}>) ||
  mongoose.model<IPromotion>("Promotion", promotionSchema);
