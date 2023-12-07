import express, { NextFunction, Request, Response, Router } from "express";
import groupStudyService from "../services/groupStudyService";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const groupStudyServiceInstance = new groupStudyService(decodedToken);
  req.groupStudyServiceInstance = groupStudyServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { groupStudyServiceInstance } = req;
    if (!groupStudyServiceInstance) throw new Error();

    const groupStudyData = await groupStudyServiceInstance.getgroupStudy();
    res.status(200).json(groupStudyData);
  })

  .post(
    body("groupStudy").notEmpty().withMessage("groupStudy필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudy },
      } = req;
      res.status(200).json(groupStudy?.title);
      const groupStudyId = await groupStudyServiceInstance?.creategroupStudy(
        groupStudy
      );
      res.status(200).json({ groupStudyId });
    }
  )
  .delete(
    body("groupStudyId").notEmpty().isNumeric().withMessage("groupStudyId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudyId },
      } = req;

      const groupStudyData = await groupStudyServiceInstance?.deletegroupStudy(
        groupStudyId
      );
      res.status(200).json(groupStudyData);
    }
  )
  .patch(async (req, res, next) => {
    const {
      groupStudyServiceInstance,
      body: { groupStudy },
    } = req;

    await groupStudyServiceInstance?.updategroupStudy(groupStudy);
    res.status(200).json();
  });

router
  .route("/participate")
  .post(
    body("groupStudyId").notEmpty().isNumeric().withMessage("groupStudyId필요"),
    validateCheck,
    async (req, res, next) => {
      try {
        const {
          groupStudyServiceInstance,
          body: { groupStudyId, phase },
        } = req;

        await groupStudyServiceInstance?.participategroupStudy(
          groupStudyId,
          phase
        );

        res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  )
  .delete(
    body("groupStudyId").notEmpty().isNumeric().withMessage("groupStudyId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudyId },
      } = req;

      try {
        await groupStudyServiceInstance?.deleteParticipate(groupStudyId);
        res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/comment")
  .post(
    body("groupStudyId").notEmpty().isNumeric().withMessage("groupStudyId필요"),
    body("comment").notEmpty().isString().withMessage("groupStudyId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudyId, comment },
      } = req;

      try {
        await groupStudyServiceInstance?.createComment(groupStudyId, comment);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  )
  .delete(
    body("groupStudyId").notEmpty().isNumeric().withMessage("groupStudyId필요"),
    body("commentId").notEmpty().withMessage("commentId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudyId, commentId },
      } = req;

      try {
        await groupStudyServiceInstance?.deleteComment(groupStudyId, commentId);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  )
  .patch(
    body("groupStudyId").notEmpty().isNumeric().withMessage("groupStudyId필요"),
    body("comment").notEmpty().isString().withMessage("string필요"),
    body("commentId").notEmpty().withMessage("commentId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudyId, commentId, comment },
      } = req;

      try {
        await groupStudyServiceInstance?.patchComment(
          groupStudyId,
          commentId,
          comment
        );
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  );

router
  .route("/status")
  .patch(
    body("groupStudyId").notEmpty().isNumeric().withMessage("groupStudyId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudyId, status },
      } = req;

      try {
        await groupStudyServiceInstance?.setStatus(groupStudyId, status);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  );

module.exports = router;
