import express, { NextFunction, Request, Response } from "express";
import { JWT, decode } from "next-auth/jwt";
import { IUser, User } from "../db/models/user";
import { Vote } from "../db/models/vote";
import dayjs from "dayjs";
import { getProfile, withdrawal } from "../utils/oAuthUtils";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  const decodedToken = await decode({
    token,
    secret: "klajsdflksjdflkdvdssdq231e1w",
  });

  if (!decodedToken) {
    return res.status(401).send("Unauthorized");
  } else {
    req.token = decodedToken;
    next();
  }
});

router
  .route("/active")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const isActive = await User.findOne({ uid: token.uid }, "isActive");
      return res.status(200).json({ isActive });
    } catch (err) {
      next(err);
    }
    res.send("okay");
  });

router
  .route("/avatar")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const avatar = await User.findOne({ uid: token.uid }, "avatar");

      return res.status(200).json(avatar);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/comment")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comments = await User.find({}, "comment");
      res.status(200).json({ comments });
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { comment = "" } = req.body;
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      await User.updateOne({ uid: token.uid }, { $set: { comment } });
      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  });

router
  .route("/participationrate")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { startDay, endDay }: { startDay: string; endDay: string } =
      req.query as any;

    try {
      const allUser = await User.find({ isActive: true });
      const attendForm = allUser.reduce((accumulator: any[], user) => {
        return [...accumulator, { uid: user.uid, cnt: 0 }];
      }, []);

      const forParticipation = await Vote.collection
        .aggregate([
          {
            $match: {
              date: {
                $gte: dayjs(startDay).toDate(),
                $lt: dayjs(endDay).toDate(),
              },
            },
          },
          {
            $unwind: "$participations",
          },
          {
            $project: {
              status: "$participations.status",
              attendences: "$participations.attendences",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "attendences.user",
              foreignField: "_id",
              as: "attendences.user",
            },
          },
          {
            $match: {
              status: "open",
            },
          },
          {
            $unwind: "$attendences.user",
          },
          {
            $replaceRoot: {
              newRoot: "$attendences.user",
            },
          },
          {
            $group: {
              _id: "$uid",
              cnt: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: false,
              uid: "$_id",
              cnt: "$cnt",
            },
          },
        ])
        .toArray();

      forParticipation.forEach((obj) => {
        const idx = attendForm.findIndex((user) => user.uid === obj.uid);
        attendForm[idx].cnt = obj.cnt;
      });

      return res.status(200).json(attendForm);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/voterate")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { startDay, endDay }: { startDay: string; endDay: string } =
      req.query as any;

    try {
      const allUser = await User.find({ isActive: true });
      const attendForm = allUser.reduce((accumulator: any[], user) => {
        return [...accumulator, { uid: user.uid, cnt: 0 }];
      }, []);

      const forVote = await Vote.collection
        .aggregate([
          {
            $match: {
              date: {
                $gte: dayjs(startDay).toDate(),
                $lt: dayjs(endDay).toDate(),
              },
            },
          },
          { $unwind: "$participations" },
          { $unwind: "$participations.attendences" },
          {
            $project: {
              attendences: "$participations.attendences",
            },
          },
          {
            $match: {
              "attendences.firstChoice": true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "attendences.user",
              foreignField: "_id",
              as: "attendences.user",
            },
          },
          {
            $unwind: "$attendences.user",
          },
          {
            $replaceRoot: {
              newRoot: "$attendences.user",
            },
          },
          {
            $group: {
              _id: "$uid",
              cnt: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: false,
              uid: "$_id",
              cnt: "$cnt",
            },
          },
        ])
        .toArray();

      forVote.forEach((obj) => {
        const idx = attendForm.findIndex((user) => user.uid === obj.uid);
        attendForm[idx].cnt = obj.cnt;
      });

      return res.status(200).json(attendForm);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/profile")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req;
      if (!token) return res.status(401).send("Unauthorized");

      const targetUser = await User.findOne({ uid: token.uid });
      return res.status(200).json(targetUser);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const registerForm = req.body || {};
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      await User.updateOne({ uid: token.uid }, { $set: registerForm });
      const undatedUser = await User.findOne({ uid: token.uid });
      return res.status(200).json(undatedUser);
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const profile = await getProfile(
        token.accessToken as string,
        token.uid as string
      );

      if (!profile) {
        return res.status(500).end();
      }

      await User.updateOne({ uid: token.uid }, { $set: profile });

      return res.status(200).json(await User.findOne({ uid: token.uid }));
    } catch (err) {
      next(err);
    }
  });

router
  .route("/point")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const userPoint = await User.findOne({ uid: token.uid }, "point");
      return res.status(200).send(userPoint);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { point } = req.body;
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const user = await User.findOne({ uid: token.uid });
      if (!user) throw new Error();

      user.point += point;
      await user.save();
      res.send("okay");

      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  });

router
  .route("/profile")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");
    try {
      const targetUser = await User.findOne({ uid: token.uid });
      return res.status(200).json(targetUser);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const registerForm = req.body;
      await User.updateOne({ uid: token.uid }, { $set: registerForm });
      const undatedUser = await User.findOne({ uid: token.uid });
      return res.status(200).json(undatedUser);
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const profile = await getProfile(
        token.accessToken as string,
        token.uid as string
      );

      if (!profile) {
        return res.status(500).end();
        return;
      }

      await User.updateOne({ uid: token.uid }, { $set: profile });

      return res.status(200).json(await User.findOne({ uid: token.uid }));
    } catch (err) {
      next(err);
    }
  });

router
  .route("/rest")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const { info } = req.body;
      await User.updateOne({ uid: token.uid }, { $set: { rest: info } });
      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  });

router
  .route("/rest")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userScore = await User.collection
        .aggregate([
          {
            $match: {
              isActive: true,
            },
          },
          {
            $project: {
              name: 1,
              score: 1,
            },
          },
        ])
        .toArray();

      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { score, message } = req.body;
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const user = await User.findOne({ uid: token.uid });
      if (!user) throw new Error();
      user.score += score;
      await user.save();
      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {});

router
  .route("/rest")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const userScore = await User.collection
      .aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $project: {
            name: 1,
            score: 1,
          },
        },
      ])
      .toArray();

    return res.status(200).send(userScore);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { score, message } = req.body;
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const user = await User.findOne({ uid: token.uid });
      if (!user) throw new Error();

      user.score += score;
      await user?.save();
      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  });

router
  .route("/withdrawal")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      await withdrawal(token.accessToken as string);
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  });
module.exports = router;
