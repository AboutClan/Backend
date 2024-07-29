import dayjs from "dayjs";
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
      }).populate(["contents.user"]);
      interface Chat {
        user1: string;
        user2: string;
      }
      interface GroupedChats {
        [key: string]: Chat[];
      }

      const groupedChats: GroupedChats = {};

      chats.forEach((chat) => {
        // 내 UID와 다른 UID를 구분합니다.
        const otherUID =
          chat.user1 === this.token.uid ? chat.user2 : chat.user1;

        // 다른 UID를 키로 사용하여 그룹화합니다.
        if (!groupedChats[otherUID]) {
          groupedChats[otherUID] = [];
        }
        groupedChats[otherUID].push(chat);
      });
      return chats
        .map((chat) => ({
          user: chat.contents?.[0]?.user,
          contents: chat.contents,
        }))
        .sort((a, b) =>
          dayjs(a.contents[a.contents.length - 1].createdAt).isAfter(
            dayjs(b.contents[b.contents.length - 1].createdAt),
          )
            ? 1
            : -1,
        );
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
        user: this.token.id,
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
