import dayjs from "dayjs";
import { JWT } from "next-auth/jwt";
import { Chat } from "../db/models/chat";
import { User } from "../db/models/user";
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

    try {
      const chat = await Chat.findOne({ user1, user2 });
      return chat?.contents;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getChats() {
    try {
      const chats = await Chat.find({
        $or: [{ user1: this.token.uid }, { user2: this.token.uid }],
      });

      const chatWithUsers = await Promise.all(
        chats.map(async (chat) => {
          const opponentUid =
            chat.user1 === this.token.uid ? chat.user2 : chat.user1;
          const opponent = await User.findOne({ uid: opponentUid });

          return {
            user: opponent,
            contents: chat.contents,
          };
        }),
      );

      return chatWithUsers.sort((a, b) => {
        const dateA = dayjs(a.contents[a.contents.length - 1].createdAt);
        const dateB = dayjs(b.contents[b.contents.length - 1].createdAt);
        return dateA.isAfter(dateB) ? 1 : -1;
      });
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
