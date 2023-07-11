import express, { NextFunction, Request, Response } from "express";
import RegisterService from "../services/registerService";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";

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
  .post(
    body("uid").isEmpty().withMessage("uid필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  )
  .delete(
    body("uid").isEmpty().withMessage("uid필요"),
    validateCheck,
    async (req: Request, res: Response, next: NextFunction) => {
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
    }
  );

module.exports = router;
