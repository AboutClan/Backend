import express, { NextFunction, Request, Response } from "express";
import { JWT, decode } from "next-auth/jwt";
import { IUser, User } from "../db/models/user";
import { Vote } from "../db/models/vote";
import dayjs from "dayjs";
import { getProfile } from "../utils/oAuthUtils";

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

router.get("/", (req: Request, res: Response) => {
  res.send("okay");
});

router.route("/active").get(async (req: Request, res: Response) => {
  const { token } = req;
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const isActive = await User.findOne({ uid: token.uid }, "isActive");
    res.status(200).json({ isActive });
  } catch (err) {
    res.status(500).send("db처리중 에러 발생");
  }
  res.send("okay");
});

router
  .route("/active")
  .get(async (req: Request, res: Response) => {
    try {
      const comments = await User.find({}, "comment");
      res.status(200).json({ comments });
    } catch (err) {
      res.status(500).send("db처리중 에러 발생");
    }
  })
  .post(async (req: Request, res: Response) => {
    const { comment } = req.body;
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      await User.updateOne({ uid: token.uid }, { $set: { comment } });
      res.status(200).send({});
    } catch (err) {
      res.status(500).send("db처리중 에러 발생");
    }
  });

router.route("/participationrate").get(async (req: Request, res: Response) => {
  const { startDay, endDay }: { startDay: string; endDay: string } =
    req.query as any;

  try {
    const allUser = await User.find({ isActive: true });
    const attendForm = allUser.reduce((accumulator, user) => {
      return { ...accumulator, [user.uid.toString()]: 0 };
    }, {});

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
      ])
      .toArray();

    const participationCnt = forParticipation
      .filter((vote) => vote.status === "open")
      .flatMap((vote) => vote.attendences)
      .flatMap((attendence) => attendence.user)
      .map((user) => user.uid.toString())
      .reduce((acc, val) => {
        if (val in acc) {
          acc[val]++;
        } else {
          acc[val] = 1;
        }
        return acc;
      }, {});

    const participationRateForm = { ...attendForm, ...participationCnt };

    const result = [];

    for (let value in participationRateForm) {
      result.push({ uid: value, cnt: participationRateForm[value] });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).send("db처리중 에러 발생");
  }
});

router.route("/voterate").get(async (req: Request, res: Response) => {
  const { startDay, endDay }: { startDay: string; endDay: string } =
    req.query as any;

  try {
    const allUser = await User.find({ isActive: true });
    const attendForm = allUser.reduce((accumulator, user) => {
      return { ...accumulator, [user.uid.toString()]: 0 };
    }, {});

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
          $project: {
            firstChoice: "$attendences.firstChoice",
            attendences: "$attendences",
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
      ])
      .toArray();

    const voteCnt = forVote
      .flatMap((participation) => participation.attendences)
      .filter((attendence) => attendence.firstChoice === true)
      .flatMap((attendance) => attendance.user)
      .map((user) => user.uid.toString())
      .reduce((acc, val) => {
        if (val in acc) {
          acc[val]++;
        } else {
          acc[val] = 1;
        }
        return acc;
      }, {});

    const voteRateForm = { ...attendForm, ...voteCnt };
    const result = [];

    for (let value in voteRateForm) {
      result.push({ uid: value, cnt: voteRateForm[value] });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).send("db처리중 에러 발생");
  }
});

router
  .route("/profile")
  .get(async (req: Request, res: Response) => {
    try {
      const { token } = req;
      if (!token) return res.status(401).send("Unauthorized");

      const targetUser = await User.findOne({ uid: token.uid });
      res.status(200).json(targetUser);
    } catch (err) {
      res.status(500).send("db처리중 에러 발생");
    }
  })
  .post(async (req: Request, res: Response) => {
    const registerForm = req.body || {};
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      await User.updateOne({ uid: token.uid }, { $set: registerForm });
      const undatedUser = await User.findOne({ uid: token.uid });
      res.status(200).json(undatedUser);
    } catch (err) {
      res.status(500).send("db처리중 에러 발생");
    }
  })
  .patch(async (req: Request, res: Response) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const profile = await getProfile(
        token.accessToken as string,
        token.uid as string
      );

      if (!profile) {
        res.status(500).end();
        return;
      }

      await User.updateOne({ uid: token.uid }, { $set: profile });

      res.status(200).json(await User.findOne({ uid: token.uid }));
    } catch (err) {}
  });

router
  .route("/point")
  .get(async (req: Request, res: Response) => {
    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const userPoint = await User.findOne({ uid: token.uid }, "point");
      res.status(200).send(userPoint);
    } catch (err) {
      res.status(500).send("db처리중 에러 발생");
    }
  })
  .post(async (req: Request, res: Response) => {
    const { token } = req;
    const { point } = req.body;
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const user = await User.findOne({ uid: token.uid });
      if (!user) return res.status(500).send("존재하지 않는 user입니다.");

      user.point += point;
      await user.save();
      res.send("okay");

      res.status(200).send({});
    } catch (err) {
      res.status(500).send("db처리중 에러 발생");
    }
  });

module.exports = router;
