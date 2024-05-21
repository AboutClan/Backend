const webpush = require("web-push");

const vapidKeys = {
  publicKey:
    "BMYZFWI90gjzwR3CFd_lymPpzzz3qtBJ2oY9dC-pQwNbVFDIsU4Bht3pxQF-yqsv-nz4Ax7OwjFGADNM_nJK3AU",
  privateKey: "wy6pvNHd-KWGQZ7sWNHUR4975whXcima6HeNC14tIQs",
};

webpush.setVapidDetails(
  "mailto:alsrhks0503@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

webpush.sendNotification(
  {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cRngP9o7apw:APA91bG5_i-BS2WBUSehlWxe4Pr2PLhugyvCtIcNgFSs2RcSSth60wmC61R9SH-Iq3tFpO1tqprXcFFze4ZduL-MsSGWP9DJvm7jEbWB3nM40Ui99VFNPsnoHUx-emEceevzR6vwATMn",
    keys: {
      auth: "BjJjTUVFQi9UCBH-VqqVAg",
      p256dh:
        "BDDJ_YGSawW1NowpbJ1Cl0N8JiFtsSuMBjjtWCly7lBrf4wnsrJP7xlVTqBKhhaMIP3RwkCfb5oSSwDVh1fbYp4",
    },
  },
  "웹푸쉬발송!",
);
