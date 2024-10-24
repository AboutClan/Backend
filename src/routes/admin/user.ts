import express, { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { IUser, User } from "../../db/models/user";
import validateCheck from "../../middlewares/validator";
import AdminUserService from "../../services/adminUserServices";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const adminUserServiceInstance = new AdminUserService(decodedToken);
  req.adminUserServiceInstance = adminUserServiceInstance;
  next();
});

export type UserFilterType =
  | "score"
  | "monthScore"
  | "weekStudyAccumulationMinutes";

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminUserServiceInstance,
      query: { location, isSummary, filterType },
    } = req;

    const allUser = await adminUserServiceInstance?.getAllUser(
      location as string,
      isSummary === "true",
      filterType as UserFilterType,
    );

    return res.status(200).json(allUser);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;

    const { profile }: { profile: IUser } = req.body;

    await adminUserServiceInstance?.updateProfile(profile);

    return res.status(200).end();
  });

router
  .route("/:id/point")
  .post(
    body("value").notEmpty().isNumeric().withMessage("value필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        adminUserServiceInstance,
        params: { id: uid },
        body: { value, message = "" },
      } = req;

      if (!value) return res.status(400).send("no value");

      await adminUserServiceInstance?.updateValue(
        uid as string,
        value,
        "point",
        message,
      );
      return res.status(200).end();
    },
  );

router
  .route("/:id/score")
  .post(
    body("value").notEmpty().isNumeric().withMessage("value필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        adminUserServiceInstance,
        params: { id: uid },
        body: { value, message = "" },
      } = req;

      await adminUserServiceInstance?.updateValue(
        uid as string,
        value,
        "score",
        message,
      );
      res.status(200).end();
    },
  );

router
  .route("/:id/deposit")
  .post(
    body("value").notEmpty().isNumeric().withMessage("value필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        adminUserServiceInstance,
        params: { id: uid },
        body: { value, message = "" },
      } = req;

      if (!value) return res.status(400).send("no value");

      await adminUserServiceInstance?.updateValue(
        uid as string,
        value,
        "deposit",
        message,
      );
      res.status(200).end();
    },
  );

router
  .route("/point")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;

    await adminUserServiceInstance?.deletePoint();
    return res.status(200).end();
  });

router
  .route("/score")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;

    await adminUserServiceInstance?.deleteScore();
    return res.status(200).end();
  });

router
  .route("/:id/info")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    const { id: uid } = req.query;

    const user = await adminUserServiceInstance?.getCertainUser(uid as string);
    return res.status(200).json(user);
  });

router
  .route("/:id/role")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    const {
      params: { id: uid },
      body: { role },
    } = req;

    adminUserServiceInstance?.setRole(role, uid);
    return res.status(200).end();
  });

router
  .route("/:id/belong")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminUserServiceInstance,
      body: { belong },
      params: { id: uid },
    } = req;
    try {
      await adminUserServiceInstance?.updateBelong(uid, belong);
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/test")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    await User.updateMany({}, { role: "human" });
    return res.status(200).end();
  });

module.exports = router;
