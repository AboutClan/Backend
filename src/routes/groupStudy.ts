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
    return res.status(200).json("Conntect");
    const gatherData = await groupStudyServiceInstance?.getGroupStudy();
    res.status(200).json(gatherData);
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

module.exports = router;
