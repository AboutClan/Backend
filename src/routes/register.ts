import express, { NextFunction, Request, Response } from "express";
import RegisterService from "../services/registerService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const registerServiceInstance = new RegisterService();
  req.registerServiceInstance = registerServiceInstance;
  next();
});

router
  .route("/")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const registerForm = req.body;

    const { registerServiceInstance } = req;
    if (!registerServiceInstance) return res.status(401).send("Unauthorized");

    const user = await registerServiceInstance.register(registerForm);

    res.status(200).json({ user });
  });

module.exports = router;
