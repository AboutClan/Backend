import express, { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import GatherService from "../services/gatherService";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const gatherServiceInstance = new GatherService(decodedToken);
  req.gatherServiceInstance = gatherServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { gatherServiceInstance } = req;
    const { cursor } = req.query as { cursor?: string };
    const cursorNum = cursor ? parseInt(cursor) : null;

    if (!gatherServiceInstance) throw new Error();
    const gatherData = await gatherServiceInstance.getGather(cursorNum);
    res.status(200).json(gatherData);
  })
  .post(
    body("gather").notEmpty().withMessage("gather필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        gatherServiceInstance,
        body: { gather },
      } = req;

      const gatherId = await gatherServiceInstance?.createGather(gather);
      res.status(200).json({ gatherId });
    },
  )
  .delete(
    body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        gatherServiceInstance,
        body: { gatherId },
      } = req;

      const gatherData = await gatherServiceInstance?.deleteGather(gatherId);
      res.status(200).json(gatherData);
    },
  )
  .patch(async (req, res, next) => {
    const {
      gatherServiceInstance,
      body: { gather },
    } = req;

    await gatherServiceInstance?.updateGather(gather);
    res.status(200).json();
  });

router
  .route("/participate")
  .post(
    body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
    validateCheck,
    async (req, res, next) => {
      try {
        const {
          gatherServiceInstance,
          body: { gatherId, phase, userId },
        } = req;

        await gatherServiceInstance?.participateGather(gatherId, phase, userId);

        res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
  )
  .delete(
    body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        gatherServiceInstance,
        body: { gatherId },
      } = req;

      try {
        await gatherServiceInstance?.deleteParticipate(gatherId);
        res.status(200).end();
      } catch (err) {
        next(err);
      }
    },
  );

router
  .route("/comment")
  .post(
    body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
    body("comment").notEmpty().isString().withMessage("gatherId필요"),
    validateCheck,
    async (req, res, next) => {
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
    },
  )
  .delete(
    body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
    body("commentId").notEmpty().withMessage("commentId필요"),
    validateCheck,
    async (req, res, next) => {
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
    },
  )
  .patch(
    body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
    body("comment").notEmpty().isString().withMessage("string필요"),
    body("commentId").notEmpty().withMessage("commentId필요"),
    validateCheck,
    async (req, res, next) => {
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
    },
  );

router
  .route("/status")
  .patch(
    body("gatherId").notEmpty().isNumeric().withMessage("gatherId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        gatherServiceInstance,
        body: { gatherId, status },
      } = req;

      try {
        await gatherServiceInstance?.setStatus(gatherId, status);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    },
  );

module.exports = router;
