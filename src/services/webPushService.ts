import { JWT } from "next-auth/jwt";
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
      isAlwaysUseFCM: true,
    };

    // Send 201 - resource created
    const payload = JSON.stringify({
      title: "스터디 투표",
      body: "희오 사랑해",
      badge:
        "https://studyabout.s3.ap-northeast-2.amazonaws.com/%EB%8F%99%EC%95%84%EB%A6%AC/ALogo.png",
      icon: "https://studyabout.s3.ap-northeast-2.amazonaws.com/%EB%8F%99%EC%95%84%EB%A6%AC/144.png",

      data: {
        url: "https://studyabout.herokuapp.com/",
        notificationType: "studyReminder",
      },
      tag: "unique_tag_for_this_notification",
      requireInteraction: true,
      silent: false,
      renotify: true,
      timestamp: Date.now(),
      vibrate: [100, 50, 100],
      priority: "high",
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
