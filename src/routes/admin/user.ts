import express, { NextFunction, Request, Response } from "express";
import AdminUserService from "../../services/adminUserServices";
import { IUser } from "../../db/models/user";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const adminUserServiceInstance = new AdminUserService();
  req.adminUserServiceInstance = adminUserServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    const allUser = await adminUserServiceInstance.getAllUser();

    res.status(200).json(allUser);
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    const { profile }: { profile: IUser } = req.body;

    await adminUserServiceInstance.updateProfile(profile);

    res.status(200).end();
  });

router
  .route("/:id/point")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    const { id: uid } = req.query;

    await adminUserServiceInstance.deletePoint();
    res.status(200).end();
  });

router
  .route("/:id/score")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    const { id: uid } = req.query;

    await adminUserServiceInstance.deletePoint();
    res.status(200).end();
  });

router
  .route("/:id/deposit")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    const { id: uid } = req.query;

    await adminUserServiceInstance.deletePoint();
    res.status(200).end();
  });

router
  .route("/point")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    await adminUserServiceInstance.deletePoint();
    res.status(200).end();
  });

router
  .route("/score")
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    await adminUserServiceInstance.deleteScore();
    res.status(200).end();
  });

router
  .route("/:id/info")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    const { id: uid } = req.query;

    const user = await adminUserServiceInstance.getCertainUser(uid as string);
    res.status(200).json(user);
  });

router
  .route("/:id/role")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();

    const { id: uid } = req.body;
    const { role } = req.body;

    adminUserServiceInstance.setRole(role, uid);
  });

module.exports = router;
