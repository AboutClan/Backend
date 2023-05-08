import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import UserService from "../services/userService";

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
    const userServiceInstance = new UserService(decodedToken);
    req.userServiceInstance = userServiceInstance;
    next();
  }
});

router
  .route("/active")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const isActive = await userServiceInstance.getUserInfo(["isActive"]);
      return res.status(200).json(isActive);
    } catch (err) {
      next(err);
    }
    res.send("okay");
  });

router
  .route("/avatar")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const avatar = await userServiceInstance.getUserInfo(["avatar"]);
      return res.status(200).json(avatar);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/comment")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const comments = await userServiceInstance.getAllUserInfo([
        "comment",
        "name",
      ]);
      res.status(200).json({ comments });
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { comment = "" } = req.body;
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      await userServiceInstance.updateUser({ comment });
      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  });

router
  .route("/participationrate")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const { startDay, endDay }: { startDay: string; endDay: string } =
      req.query as any;

    try {
      const participationResult =
        await userServiceInstance.getParticipationRate(startDay, endDay);

      return res.status(200).json(participationResult);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/voterate")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const { startDay, endDay }: { startDay: string; endDay: string } =
      req.query as any;

    try {
      const voteResult = await userServiceInstance.getParticipationRate(
        startDay,
        endDay
      );

      return res.status(200).json(voteResult);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/profile")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");
    try {
      const targetUser = await userServiceInstance.getUserInfo([]);
      return res.status(200).json(targetUser);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");
    const registerForm = req.body || {};

    try {
      await userServiceInstance.updateUser(registerForm);
      const undatedUser = await userServiceInstance.getUserInfo([]);
      return res.status(200).json(undatedUser);
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const updatedUser = await userServiceInstance.patchProfile();
      return res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/point")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const userPoint = await userServiceInstance.getUserInfo(["point"]);

      return res.status(200).send(userPoint);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { point } = req.body;

    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      await userServiceInstance.updatePoint(point);

      return res.status(200).json({});
    } catch (err) {
      next(err);
    }
  });

router
  .route("/rest")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { info } = req.body;

    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      await userServiceInstance.updateUser({ rest: info });
      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  });

router
  .route("/score")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      const userScore = await userServiceInstance.getUserInfo([
        "name",
        "score",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { score, message } = req.body;

    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    try {
      await userServiceInstance.updateScore(score);
      return res.status(200).send({});
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {});

router
  .route("/score/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const userScore = await userServiceInstance.getAllUserInfo([
      "name",
      "score",
    ]);

    return res.status(200).send(userScore);
  });

// router
//   .route("/withdrawal")
//   .delete(async (req: Request, res: Response, next: NextFunction) => {
//     const { token } = req;
//     if (!token) return res.status(401).send("Unauthorized");

//     try {
//       await withdrawal(token.accessToken as string);
//       return res.status(204).end();
//     } catch (err) {
//       next(err);
//     }
//   });
module.exports = router;
