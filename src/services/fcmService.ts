import { JWT } from "next-auth/jwt";
import admin from "firebase-admin";
import { FcmToken } from "../db/models/fcmToken";

export default class FcmService {
  private token: JWT;

  constructor(token?: JWT) {
    this.token = token as JWT;
    const fcm = process.env.FCM_INFO;
    if (!admin.apps.length && fcm) {
      const serviceAccount = JSON.parse(fcm);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async sendNotification(token: any, message: any) {
    const payload = {
      token: token,
      notification: {
        title: message?.notification.title || "알림",
        body: message?.notification.body || "알림",
      },
      webpush: {
        headers: {
          TTL: "1",
        },
      },
    };

    try {
      const response = await admin.messaging().send(payload);

      return response;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async deleteToken(uid: string, platform: string) {
    await FcmToken.updateOne(
      {
        uid,
      },
      {
        $pull: {
          devices: { platform },
        },
      },
    );
  }

  async registerToken(uid: string, fcmToken: string, platform: string) {
    try {
      const fcmTokenOne = await FcmToken.findOne({ uid });

      if (fcmTokenOne) {
        const tokenExists = fcmTokenOne.devices.some(
          (device) => device.token === fcmToken,
        );

        if (!tokenExists) {
          fcmTokenOne.devices.push({ token: fcmToken, platform });
          await fcmTokenOne.save();
        }
      } else {
        FcmToken.create({
          uid,
          devices: [{ token: fcmToken, platform }],
        });
      }
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async sendNotificationToX(uid: string) {
    const user = await FcmToken.findOne({ uid });

    this.sendNotification(user?.devices[0].token, {});
  }
}
