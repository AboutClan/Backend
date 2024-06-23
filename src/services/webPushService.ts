import { JWT } from "next-auth/jwt";
import { GiftModel } from "../db/models/gift";
import { NotificationSub } from "../db/models/notificationSub";
const webPush = require("web-push");
const PushNotifications = require("node-pushnotifications");

export default class WebPushService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async subscribe(subscription: any) {
    try {
      const data = await NotificationSub.findOne({
        uid: this.token.uid,
        endpoint: subscription.endpoint,
      });

      if (!data) {
        const newSubscription = new NotificationSub({
          ...subscription,
          uid: this.token?.uid,
        });

        await newSubscription.save();
      }

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async sendNotificationAllUser() {
    const settings = {
      web: {
        vapidDetails: {
          subject: "mailto:alsrhks0503@gmail.com",
          publicKey: process.env.PUBLIC_KEY,
          privateKey: process.env.PRIVATE_KEY,
        },
        gcmAPIKey: "gcmkey",
        TTL: 2419200,
        contentEncoding: "aes128gcm",
        headers: {},
      },
      isAlwaysUseFCM: false,
    };

    // Send 201 - resource created
    const payload = JSON.stringify({
      title: "카공스터디 참여 투표",
      body: "마감이 얼마 남지 않았어요. 지금 신청하세요!",
      icon: "https://studyabout.s3.ap-northeast-2.amazonaws.com/%EB%8F%99%EC%95%84%EB%A6%AC/%EB%8F%99%EC%95%84%EB%A6%AC+%EC%95%84%EB%B0%94%ED%83%80.webp",
      badge:
        "https://studyabout.s3.ap-northeast-2.amazonaws.com/%EB%8F%99%EC%95%84%EB%A6%AC/A_symbol_in_a_simple_and_clean_design__suitable_fo-removebg-preview+(1).webp",
      image:
        "https://studyabout.s3.ap-northeast-2.amazonaws.com/%EB%8F%99%EC%95%84%EB%A6%AC/%EB%8F%99%EC%95%84%EB%A6%AC+%EC%95%84%EB%B0%94%ED%83%80.webp",
      data: {
        url: "https://studyabout.herokuapp.com/",
        notificationType: "studyReminder",
      },
      tag: "unique_tag_for_this_notification",
      requireInteraction: true,
      silent: false,
      renotify: true,
      timestamp: 1618307200000,
      vibrate: [100, 50, 100],
    });

    try {
      const subscriptions = await NotificationSub.find();

      subscriptions.forEach((subscription) => {
        const push = new PushNotifications(settings);

        // Create payload
        push.send(subscription, payload, (err: any, result: any) => {
          if (err) {
            console.log(err);
          } else {
          }
        });
      });
      return;
    } catch (err) {
      return;
    }
  }
}
