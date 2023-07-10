import express, { NextFunction, Request, Response } from "express";
import RegisterService from "../services/registerService";
import { decode } from "next-auth/jwt";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const registerServiceInstance = new RegisterService(decodedToken);
  req.registerServiceInstance = registerServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { registerServiceInstance } = req;

    try {
      const registeredUsers = await registerServiceInstance?.getRegister();

      return res.status(200).json(registeredUsers);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const registerForm = req.body;
    const { registerServiceInstance } = req;

    try {
      await registerServiceInstance?.register(registerForm);
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  });

router
  .route("/approval")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const {
      registerServiceInstance,
      body: { uid },
    } = req;

    try {
      await registerServiceInstance?.approve(uid);
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  })
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const {
      registerServiceInstance,
      body: { uid },
    } = req;

    try {
      await registerServiceInstance?.deleteRegisterUser(uid, null);
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
