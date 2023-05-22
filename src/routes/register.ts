import express, { NextFunction, Request, Response } from "express";
import RegisterService from "../services/registerService";
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
    const registerServiceInstance = new RegisterService(decodedToken);
    req.registerServiceInstance = registerServiceInstance;
    next();
  }
});

router
  .route("/")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const registerForm = req.body;

    const { registerServiceInstance } = req;
    if (!registerServiceInstance) return res.status(401).send("Unauthorized");

    await registerServiceInstance.register(registerForm);

    return res.status(200).end();
  });

router
  .route("/approval")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.body;

    const { registerServiceInstance } = req;
    if (!registerServiceInstance) return res.status(401).send("Unauthorized");

    await registerServiceInstance.approve(uid);

    return res.status(200).end();
  })
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.body;

    const { registerServiceInstance } = req;
    if (!registerServiceInstance) return res.status(401).send("Unauthorized");

    await registerServiceInstance.deleteRegisterUser(uid);

    return res.status(200).end();
  });

module.exports = router;
