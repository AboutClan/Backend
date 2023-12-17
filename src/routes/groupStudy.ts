import express, { NextFunction, Request, Response, Router } from "express";
import groupStudyService from "../services/groupStudyService";
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
          body: { id },
        } = req;

        await groupStudyServiceInstance?.setWaitingPerson(id);

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
          body: { id, weekRecord },
        } = req;

        const result = await groupStudyServiceInstance?.attendGroupStudy(
          id,
          weekRecord
        );

        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    }
  );

module.exports = router;
