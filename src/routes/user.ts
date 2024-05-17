import express, { NextFunction, Request, Response } from "express";
import { body, query } from "express-validator";
import validateCheck from "../middlewares/validator";
import UserService from "../services/userService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const userServiceInstance = new UserService(decodedToken);
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  req.userServiceInstance = userServiceInstance;
  next();
});

//userInfo의 필드 수정. post/patch/put 모두 상황마다 사용 가능할 거 같은데, 대부분의 경우 처음부터 존재하는 필드에 업데이트 하는 거고, 각 필드마다 통일성 유지를 위해서(프론트엔드에서 하위 필드 메소드 통일해서 정리하고 있어서. 일단 patch로 통일했음. 나중에 수정하고 싶으면 말씀해주세요!)

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
  .route("/simple")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const isActive = await userServiceInstance?.getSimpleUserInfo();
      return res.status(200).json(isActive);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/simpleAll")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const isActive = await userServiceInstance?.getAllSimpleUserInfo();
      console.log(321, isActive);
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
  .patch(
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { type, bg },
      } = req;

      try {
        await userServiceInstance?.updateUser({
          avatar: { type, bg },
        });
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
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
  .patch(
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
    },
  );

router
  .route("/role")
  .patch(
    body("role").notEmpty().withMessage("role입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { role },
      } = req;
      try {
        await userServiceInstance?.patchRole(role);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
  );

router
  .route("/rest")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      userServiceInstance,
      body: { info = "" },
    } = req;

    try {
      await userServiceInstance?.setRest(info);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/participationrate/all")
  .get(
    query("startDay").notEmpty().withMessage("startDay입력 필요."),
    query("endDay").notEmpty().withMessage("startDay입력 필요."),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { userServiceInstance } = req;
      const {
        startDay,
        endDay,
        location,
        summary,
      }: {
        startDay: string;
        endDay: string;
        location: string | null;
        summary: boolean;
      } = req.query as any;
      try {
        const participationResult =
          await userServiceInstance?.getParticipationRate(
            startDay,
            endDay,
            true,
            location,
            Boolean(summary),
          );
        return res.status(200).json(participationResult);
      } catch (err) {
        next(err);
      }
    },
  );

router
  .route("/participationrate")
  .get(
    query("startDay").notEmpty().withMessage("startDay입력 필요."),
    query("endDay").notEmpty().withMessage("startDay입력 필요."),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { userServiceInstance } = req;
      const {
        startDay,
        endDay,
        location,
        summary,
      }: {
        startDay: string;
        endDay: string;
        location: string | null;
        summary: boolean;
      } = req.query as any;

      try {
        console.log(12);
        const participationResult =
          await userServiceInstance?.getParticipationRate(
            startDay,
            endDay,
            false,
            location,
            summary,
          );
        const userResult = participationResult?.[0];
        return res.status(200).json(userResult);
      } catch (err) {
        next(err);
      }
    },
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
          endDay,
        );

        return res.status(200).json(voteResult);
      } catch (err) {
        next(err);
      }
    },
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
  .route("/profile/:uid")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    const { uid } = req.params;

    try {
      const isActive = await userServiceInstance?.getUserWithUid(uid);
      return res.status(200).json(isActive);
    } catch (err) {
      next(err);
    }
  });
router
  .route("/profiles")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    const { uids } = req.query;

    try {
      const results = await userServiceInstance?.getUsersWithUids(
        uids as string[],
      );
      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/changeInactive")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const results = await userServiceInstance?.setUserInactive();
      return res.status(200).json(results);
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
  .patch(
    body("point").notEmpty().isNumeric().withMessage("point입력 필요."),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { point, message = "", sub },
      } = req;

      try {
        await userServiceInstance?.updatePoint(point, message, sub);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
  );

router
  .route("/score")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userScore = await userServiceInstance?.getUserInfo(["score"]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  })
  .patch(
    body("score").notEmpty().isNumeric().withMessage("score입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { score, message, sub },
      } = req;

      try {
        await userServiceInstance?.updateScore(score, message, sub);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
  );

router.route("/histories/score").get(async (req, res, next) => {
  const { userServiceInstance } = req;

  try {
    const logs = await userServiceInstance?.getLog("score");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/histories/monthScore").get(async (req, res, next) => {
  const { userServiceInstance } = req;

  try {
    const logs = await userServiceInstance?.getMonthScoreLog();
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/histories/score/all").get(async (req, res, next) => {
  const { userServiceInstance } = req;

  try {
    const logs = await userServiceInstance?.getAllLog("score");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/histories/point").get(async (req, res, next) => {
  const { userServiceInstance } = req;

  try {
    const logs = await userServiceInstance?.getLog("point");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/histories/point/all").get(async (req, res, next) => {
  const { userServiceInstance } = req;

  try {
    const logs = await userServiceInstance?.getAllLog("point");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/histories/deposit").get(async (req, res, next) => {
  const { userServiceInstance } = req;

  try {
    const logs = await userServiceInstance?.getLog("deposit");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router.route("/histories/deposit/all").get(async (req, res, next) => {
  const { userServiceInstance } = req;

  try {
    const logs = await userServiceInstance?.getAllLog("deposit");
    return res.status(200).json(logs);
  } catch (err: any) {
    next(err);
  }
});

router
  .route("/monthScore")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userScore = await userServiceInstance?.getUserInfo(["monthScore"]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  })
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      await userServiceInstance?.initMonthScore();
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/deposit")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;

    try {
      const userScore = await userServiceInstance?.getUserInfo(["deposit"]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  })
  .patch(
    body("deposit").notEmpty().isNumeric().withMessage("deposit입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { deposit, message, sub },
      } = req;

      try {
        await userServiceInstance?.updateDeposit(deposit, message, sub);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
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
    },
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
  .route("/promotion")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userServiceInstance } = req;

      const promotionData = await userServiceInstance?.getPromotion();
      return res.status(200).json(promotionData);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userServiceInstance,
        body: { name },
      } = req;

      await userServiceInstance?.setPromotion(name);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });
router
  .route("/friend")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { userServiceInstance } = req;
    try {
      const friend = await userServiceInstance?.getUserInfo(["friend"]);
      return res.status(200).json(friend);
    } catch (err: any) {
      next(err);
    }
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      userServiceInstance,
      body: { toUid },
    } = req;
    try {
      await userServiceInstance?.setFriend(toUid);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  })
  .delete(
    body("toUid").notEmpty().isString().withMessage("toUid필요"),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { toUid },
      } = req;
      try {
        const friend = await userServiceInstance?.deleteFriend(toUid);
        return res.status(200).end(friend);
      } catch (err) {
        next(err);
      }
    },
  );

router
  .route("/belong")
  .patch(
    body("uid").notEmpty().withMessage("uid입력 필요."),
    body("belong").notEmpty().withMessage("belong입력 필요."),
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        userServiceInstance,
        body: { uid, belong },
      } = req;
      try {
        await userServiceInstance?.patchBelong(uid, belong);
        return res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
  );

router
  .route("/test")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    throw new Error("what?");
  });
module.exports = router;
