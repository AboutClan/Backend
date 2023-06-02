import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import UserService from "../services/userService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token?.toString() == "undefined" || !token)
    return res.status(401).send("Unauthorized");

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

    const isActive = await userServiceInstance.getUserInfo(["isActive"]);
    return res.status(200).json(isActive);
  });

router
  .route("/avatar")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const avatar = await userServiceInstance.getUserInfo(["avatar"]);
    return res.status(200).json(avatar);
  });

router
  .route("/comment")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const comments = await userServiceInstance.getAllUserInfo([
      "comment",
      "name",
    ]);
    res.status(200).json({ comments });
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { comment = "" } = req.body;
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    await userServiceInstance.updateUser({ comment });
    return res.status(200).end();
  });

router
  .route("/participationrate")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const { startDay, endDay }: { startDay: string; endDay: string } =
      req.query as any;

    const participationResult = await userServiceInstance.getParticipationRate(
      startDay,
      endDay
    );

    return res.status(200).json(participationResult);
  });

router
  .route("/voterate")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const { startDay, endDay }: { startDay: string; endDay: string } =
      req.query as any;

    const voteResult = await userServiceInstance.getParticipationRate(
      startDay,
      endDay
    );

    return res.status(200).json(voteResult);
  });

router
  .route("/profile")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const targetUser = await userServiceInstance.getUserInfo([]);
    return res.status(200).json(targetUser);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");
    const registerForm = req.body || {};

    await userServiceInstance.updateUser(registerForm);
    const undatedUser = await userServiceInstance.getUserInfo([]);
    return res.status(200).json(undatedUser);
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const updatedUser = await userServiceInstance.patchProfile();
    return res.status(200).json(updatedUser);
  });

router
  .route("/point")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const userPoint = await userServiceInstance.getUserInfo(["point"]);
    return res.status(200).send(userPoint);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { point } = req.body;

    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    await userServiceInstance.updatePoint(point);
    return res.status(200).end();
  });

router
  .route("/rest")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { info } = req.body;

    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    await userServiceInstance.updateUser({ rest: info });
    return res.status(200).end();
  });

router
  .route("/score")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    const userScore = await userServiceInstance.getUserInfo(["name", "score"]);
    return res.status(200).send(userScore);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    console.log(1);
    const { score, message } = req.body;

    const { userServiceInstance } = req;
    if (!userServiceInstance) return res.status(401).send("Unauthorized");

    await userServiceInstance.updateScore(score);
    return res.status(200).end();
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
