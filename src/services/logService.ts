import { JWT } from "next-auth/jwt";
import { Log } from "../db/models/log";

export default class LogService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getLog(type: string) {
    const logs = await Log.collection
      .aggregate([
        {
          $match: {
            meta: {
              type,
              uid: this.token.uid,
            },
          },
        },
        {
          $project: {
            _id: false,
            timestamp: "$timestamp",
            message: "$message",
            meta: "$meta",
          },
        },
      ])
      .toArray();

    return logs;
  }

  async getAllLog(type: string) {
    const logs = await Log.find(
      { "meta.type": type },
      "-_id timestamp message meta"
    );
    // const logs = await Log.collection
    //   .aggregate([
    //     {
    //       $match: {
    //         "$meta.type": type,
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: false,
    //         timestamp: "$timestamp",
    //         message: "$message",
    //         meta: "$meta",
    //       },
    //     },
    //   ])
    //   .toArray();

    return logs;
  }
}
