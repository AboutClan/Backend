import express, { NextFunction, Request, Response, Router } from "express";
import GatherService from "../services/gatherService";
import { decode } from "next-auth/jwt";

const router: Router = express.Router();

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
    const gatherServiceInstance = new GatherService(decodedToken);
    req.gatherServiceInstance = gatherServiceInstance;
    next();
  }
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { gatherServiceInstance } = req;
    if (!gatherServiceInstance) throw new Error();

    const gatherData = await gatherServiceInstance.getGather();
    res.status(200).json(gatherData);
  })
  .post(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gather },
    } = req;

    const gatherId = await gatherServiceInstance?.createGather(gather);
    res.status(200).json({ gatherId });
  })
  .delete(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gatherId },
    } = req;

    const gatherData = await gatherServiceInstance?.deleteGather(gatherId);
    res.status(200).json(gatherData);
  });

router
  .route("/participate")
  .post(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gatherId, phase },
    } = req;

    await gatherServiceInstance?.participateGather(gatherId, phase);

    res.status(200).end();
  })
  .delete(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gatherId },
    } = req;

    await gatherServiceInstance?.deleteParticipate(gatherId);
    res.status(200).end();
  });

router
  .route("/comment")
  .post(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gatherId, comment },
    } = req;

    try {
      await gatherServiceInstance?.createComment(gatherId, comment);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gatherId, commentId },
    } = req;

    try {
      await gatherServiceInstance?.deleteComment(gatherId, commentId);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  })
  .patch(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gatherId, commentId, comment },
    } = req;

    try {
      await gatherServiceInstance?.patchComment(gatherId, commentId, comment);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  });

router.route("/open").patch(async (req, res, next) => {
  const {
    gatherServiceInstance,
    body: { gatherId },
  } = req;

  try {
    await gatherServiceInstance?.setStatus(gatherId, "open");
    res.status(200).end();
  } catch (err: any) {
    next(err);
  }
});

router.route("/close").patch(async (req, res, next) => {
  const {
    gatherServiceInstance,
    body: { gatherId },
  } = req;

  try {
    await gatherServiceInstance?.setStatus(gatherId, "close");
    res.status(200).end();
  } catch (err: any) {
    next(err);
  }
});

router.route("/end").patch(async (req, res, next) => {
  const {
    gatherServiceInstance,
    body: { gatherId },
  } = req;

  try {
    await gatherServiceInstance?.setStatus(gatherId, "end");
    res.status(200).end();
  } catch (err: any) {
    next(err);
  }
});

module.exports = router;
