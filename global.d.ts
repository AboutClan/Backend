import { Mongoose } from "mongoose";

export declare global {
  var mongoose: {
    conn?: Mongoose;
    promise?: Promise<Mongoose>;
  };

  var _mongoClientPromise: Promise<MongoClient>;
}
