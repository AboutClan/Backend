import express, { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import GroupStudyService from "../services/groupStudyService";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const groupStudyServiceInstance = new GroupStudyService(decodedToken);
  req.groupStudyServiceInstance = groupStudyServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { groupStudyServiceInstance } = req;
    if (!groupStudyServiceInstance) throw new Error();

    const groupStudyData = await groupStudyServiceInstance?.getGroupStudy();
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

      const groupStudyId = await groupStudyServiceInstance?.createGroupStudy(
        groupStudy
      );
      res.status(200).json({ groupStudyId });
    }
  )
  .patch(
    body("groupStudy").notEmpty().withMessage("groupStudy필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { groupStudy },
      } = req;

      await groupStudyServiceInstance?.updateGroupStudy(groupStudy);
      res.status(200).end();
    }
  );

router
  .route("/participate")
  .post(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      try {
        const {
          groupStudyServiceInstance,
          body: { id },
        } = req;

        await groupStudyServiceInstance?.participateGroupStudy(id);

        res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  )
  .delete(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { id },
      } = req;

      try {
        await groupStudyServiceInstance?.deleteParticipate(id);
        res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/participate/exile")
  .delete(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { id, toUid },
      } = req;

      try {
        await groupStudyServiceInstance?.exileParticipate(id, toUid);
        res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router
  .route("/waiting")
  .post(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      try {
        const {
          groupStudyServiceInstance,
          body: { id, answer, pointType },
        } = req;

        await groupStudyServiceInstance?.setWaitingPerson(
          id,
          pointType,
          answer
        );

        res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );
router
  .route("/waiting/status")
  .post(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      try {
        const {
          groupStudyServiceInstance,
          body: { id, status, userId },
        } = req;

        await groupStudyServiceInstance?.agreeWaitingPerson(id, userId, status);

        res.status(200).end();
      } catch (err) {
        next(err);
      }
    }
  );

router.route("/waiting/:id").get(async (req, res, next) => {
  const {
    groupStudyServiceInstance,
    params: { id },
  } = req;

  if (!groupStudyServiceInstance) throw new Error();
  const result = await groupStudyServiceInstance?.getWaitingPerson(id);
  res.status(200).json(result);
});

router.route("/attendance/:id").get(async (req, res, next) => {
  const {
    groupStudyServiceInstance,
    params: { id },
  } = req;
  if (!groupStudyServiceInstance) throw new Error();

  const result = await groupStudyServiceInstance?.getAttendanceGroupStudy(id);
  res.status(200).json(result);
});

router
  .route("/attendance")
  .patch(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      try {
        const {
          groupStudyServiceInstance,
          body: { id, weekRecord, type, weekRecordSub },
        } = req;

        const result = await groupStudyServiceInstance?.attendGroupStudy(
          id,
          weekRecord,
          type,
          weekRecordSub
        );

        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    }
  );
router
  .route("/attendance/confirm")
  .patch(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      try {
        const {
          groupStudyServiceInstance,
          body: { id },
        } = req;

        const result = await groupStudyServiceInstance?.patchAttendanceWeek(id);

        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    }
  );
router
  .route("/comment")
  .post(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    body("comment").notEmpty().isString().withMessage("id필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { id, comment },
      } = req;

      try {
        await groupStudyServiceInstance?.createComment(id, comment);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  )
  .delete(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    body("commentId").notEmpty().withMessage("commentId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { id, commentId },
      } = req;

      try {
        await groupStudyServiceInstance?.deleteComment(id, commentId);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  )
  .patch(
    body("id").notEmpty().isNumeric().withMessage("id필요"),
    body("comment").notEmpty().isString().withMessage("string필요"),
    body("commentId").notEmpty().withMessage("commentId필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        groupStudyServiceInstance,
        body: { id, commentId, comment },
      } = req;

      try {
        await groupStudyServiceInstance?.patchComment(id, commentId, comment);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  );

router.route("/belong/match").patch(validateCheck, async (req, res, next) => {
  try {
    const {
      groupStudyServiceInstance,
      body: {},
    } = req;

    res.status(200).end();
    await groupStudyServiceInstance?.belongToParticipateGroupStudy();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
