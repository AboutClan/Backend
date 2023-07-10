import express, { NextFunction, Request, Response } from "express";
import AdminUserService from "../../services/adminUserServices";
import { IUser, User } from "../../db/models/user";
import { decode } from "next-auth/jwt";

const router = express.Router();

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
    const adminUserServiceInstance = new AdminUserService(decodedToken);
    req.adminUserServiceInstance = adminUserServiceInstance;
    next();
  }
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;

    const allUser = await adminUserServiceInstance?.getAllUser();

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
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminUserServiceInstance,
      params: { id: uid },
      body: { value = 0, message = "" },
    } = req;

    if (!value) return res.status(400).send("no value");

    await adminUserServiceInstance?.updateValue(
      uid as string,
      value,
      "point",
      message
    );
    return res.status(200).end();
  });

router
  .route("/:id/score")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      adminUserServiceInstance,
      params: { id: uid },
      body: { value = 0, message = "" },
    } = req;

    await adminUserServiceInstance?.updateValue(
      uid as string,
      value,
      "score",
      message
    );
    res.status(200).end();
  });

router
  .route("/:id/deposit")
  .post(async (req: Request, res: Response, next: NextFunction) => {
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
      message
    );
    res.status(200).end();
  });

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
  .route("/test")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    await User.updateMany({}, { role: "human" });

    return res.status(200).end();
  });

module.exports = router;
