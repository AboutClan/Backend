import express, { NextFunction, Request, Response } from "express";
import { Subscription } from "../db/models/subscription";
import { NotificationSub } from "../db/models/notificationSub";
import WebPushService from "../services/webPushService";
const router = express.Router();
const _ = require("lodash");

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;
  const webPushServiceInstance = new WebPushService(decodedToken);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  req.webPushServiceInstance = webPushServiceInstance;
  next();
});

router.post("/subscribe", async (req: Request, res: Response) => {
  // Get pushSubscription object
  const subscription = req.body;

  try {
    req.webPushServiceInstance?.subscribe(subscription);
    return res.status(200).send("register success");
  } catch (err) {
    return res.status(500).send("Fail to save subscription");
  }
});

router.post(
  "/sendNotification",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.webPushServiceInstance?.sendNotificationAllUser();
      return res.status(200).send("Notification sent");
    } catch (err) {
      next();
    }
  },
);

module.exports = router;

// router.post(
//   "/push",
//   async (req: Request, res: Response, next: NextFunction) => {
//     const pushSubscription = req.body.pushSubscription;
//     const notificationMessage = req.body.notificationMessage;

//     if (!pushSubscription) {
//       res.status(400).send("error subscription required");
//       return next(false);
//     }
//     if (subscriptions.length) {
//       subscriptions.map((subscription, index) => {
//         let jsonSub = JSON.parse(subscription);

//         webpush
//           .sendNotification(jsonSub, notificationMessage)
//           .then((success: any) => handleSuccess(success, index))
//           .catch((error: any) => handleError(error, index));
//       });
//     } else {
//       res.send("no subscription message");
//       return next(false);
//     }

//     function handleSuccess(sucecss: any, index: any) {
//       res.send("single publish success message");
//       return next(false);
//     }

//     function handleError(error: any, index: any) {
//       res.status(500).send("error multiple publish");
//       return next(false);
//     }
//   },
// );

// const settings = {
//   web: {
//     vapidDetails: {
//       subject: "mailto:alsrhks0503@gmail.com", // REPLACE_WITH_YOUR_EMAIL
//       publicKey: process.env.PUBLIC_KEY,
//       privateKey: process.env.PRIVATE_KEY,
//     },
//     gcmAPIKey: "gcmkey",
//     TTL: 2419200,
//     contentEncoding: "aes128gcm",
//     headers: {},
//   },
//   isAlwaysUseFCM: false,
// };

// // Send 201 - resource created
// const push = new PushNotifications(settings);

// // Create payload
// const payload = { title: "Notification from Knock" };
// push.send(subscription, payload, (err: any, result: any) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(result);
//     console.log(result[0].message);
//   }
// });
