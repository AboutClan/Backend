import { JWT } from "next-auth/jwt";
import { Chat } from "../db/models/chat";
import FcmService from "./fcmService";
import WebPushService from "./webPushService";

export default class ChatService {
  private token: JWT;
  private fcmServiceInstance: FcmService;
  private webPushServiceInstance: WebPushService;

  constructor(token?: JWT) {
    this.token = token as JWT;
    this.fcmServiceInstance = new FcmService();
    this.webPushServiceInstance = new WebPushService();
  }

  async getChat(toUid: string) {
    const user1 = this.token.uid > toUid ? toUid : this.token.uid;
    const user2 = this.token.uid < toUid ? toUid : this.token.uid;

    console.log(user1, user2);
    try {
      const chat = await Chat.findOne({ user1, user2 });
      return chat?.contents;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createChat(toUid: string, message: string) {
    const user1 = this.token.uid > toUid ? toUid : this.token.uid;
    const user2 = this.token.uid < toUid ? toUid : this.token.uid;

    try {
      const chat = await Chat.findOne({ user1, user2 });

      const contentFill = {
        uid: this.token.uid,
        content: message,
      };

      if (chat) {
        await chat.updateOne({ $push: { contents: contentFill } });
        await chat.save();
      } else {
        await Chat.create({
          user1,
          user2,
          contents: [contentFill],
        });
      }
    } catch (err: any) {
      throw new Error(err);
    }

    await this.fcmServiceInstance.sendNotificationToX(
      toUid,
      "쪽지를 받았어요!",
      message,
    );
    await this.webPushServiceInstance.sendNotificationToX(
      toUid,
      "쪽지를 받았어요!",
      message,
    );
  }
}