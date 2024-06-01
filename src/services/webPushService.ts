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
      const newSubscription = new NotificationSub({
        ...subscription,
        uid: this.token?.uid,
      });
      await newSubscription.save();
      return;
    } catch (err) {
      return;
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
      title: "Test Notification",
      body: "This is a test notification",
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
