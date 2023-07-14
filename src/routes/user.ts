import express, { NextFunction, Request, Response } from "express";
import UserService from "../services/userService";
import { body, query } from "express-validator";
import validateCheck from "../middlewares/validator";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const userServiceInstance = new UserService(decodedToken);
  req.userServiceInstance = userServiceInstance;
  next();
});

router
  .route("/active")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const isActive = await userServiceInstance?.getUserInfo(["isActive"]);
      return res.status(200).json(isActive);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/avatar")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const avatar = await userServiceInstance?.getUserInfo(["avatar"]);
      return res.status(200).json(avatar);
    } catch (err) {
      next(err);
    }
  })
  .post(
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { type, bg },
      } = req;

      try {
        const avatar = await userServiceInstance?.updateUser({
          avatar: { type, bg },
        });
        return res.status(200).json(avatar);
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/comment")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const comments = await userServiceInstance?.getAllUserInfo([
        "comment",
        "name",
      ]);
      res.status(200).json({ comments });
    } catch (err) {
      next(err);
    }
  })
  .post(
    body("comment").notEmpty().withMessage("comment입력 필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { comment = "" },
      } = req;

      try {
        await userServiceInstance?.updateUser({ comment });
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/participationrate/all")
  .get(
    query("startDay").notEmpty().withMessage("startDay입력 필요."),
    query("endDay").notEmpty().withMessage("startDay입력 필요."),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { userServiceInstance } = req;
      const { startDay, endDay }: { startDay: string; endDay: string } =
        req.query as any;

      try {
        const participationResult =
          await userServiceInstance?.getParticipationRate(
            startDay,
            endDay,
            true
          );
        return res.status(200).json(participationResult);
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/participationrate")
  .get(
    query("startDay").notEmpty().withMessage("startDay입력 필요."),
    query("endDay").notEmpty().withMessage("startDay입력 필요."),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { userServiceInstance } = req;
      const { startDay, endDay }: { startDay: string; endDay: string } =
        req.query as any;

      try {
        const participationResult =
          await userServiceInstance?.getParticipationRate(startDay, endDay);
        return res.status(200).json(participationResult);
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/voterate")
  .get(
    query("startDay").notEmpty().withMessage("startDay입력 필요."),
    query("endDay").notEmpty().withMessage("startDay입력 필요."),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { userServiceInstance } = req;
      const { startDay, endDay }: { startDay: string; endDay: string } =
        req.query as any;

      try {
        const voteResult = await userServiceInstance?.getVoteRate(
          startDay,
          endDay
        );

        return res.status(200).json(voteResult);
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/profile")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const targetUser = await userServiceInstance?.getUserInfo([]);
      return res.status(200).json(targetUser);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    const registerForm = req.body || {};

    try {
      await userServiceInstance?.updateUser(registerForm);
      const updatedUser = await userServiceInstance?.getUserInfo([]);
      return res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const updatedUser = await userServiceInstance?.patchProfile();
      return res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/point")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userPoint = await userServiceInstance?.getUserInfo(["point"]);
      return res.status(200).send(userPoint);
    } catch (err) {
      next(err);
    }
  })
  .post(
    body("point").notEmpty().isNumeric().withMessage("point입력 필요."),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { point, message = "" },
      } = req;

      try {
        await userServiceInstance?.updatePoint(point, message);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/rest")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      userServiceInstance,
      body: { info = "" },
    } = req;

    try {
      await userServiceInstance?.updateUser({ rest: info });
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/score")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userScore = await userServiceInstance?.getUserInfo([
        "name",
        "score",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  })
  .post(
    body("score").notEmpty().isNumeric().withMessage("score입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { score, message },
      } = req;

      try {
        await userServiceInstance?.updateScore(score, message);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  )
  .patch(async (req: Request, res: Response, next: NextFunction) => {});

router
  .route("/deposit")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userScore = await userServiceInstance?.getUserInfo([
        "name",
        "deposit",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  })
  .post(
    body("deposit").notEmpty().isNumeric().withMessage("deposit입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { deposit, message },
      } = req;

      try {
        await userServiceInstance?.updateDeposit(deposit, message);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/score/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userScore = await userServiceInstance?.getAllUserInfo([
        "name",
        "score",
        "location",
        "uid",
      ]);

      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/deposit/all")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userScore = await userServiceInstance?.getAllUserInfo([
        "name",
        "deposit",
        "uid",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/preference")
  .post(
    body("place").notEmpty().withMessage("place입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { place, subPlace = [] },
      } = req;

      try {
        await userServiceInstance?.setPreference(place, subPlace);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  )
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const result = await userServiceInstance?.getPreference();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/role")
  .patch(
    body("role").notEmpty().withMessage("role입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { role },
      } = req;
      // const { role } = req.body;

      try {
        await userServiceInstance?.patchRole(role);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/test")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    throw new Error("what?");
  });
module.exports = router;
