import express, { NextFunction, Request, Response, Router } from "express";
import GatherService from "../services/gatherService";
import { decode } from "next-auth/jwt";

const router: Router = express.Router();

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
    const gatherServiceInstance = new GatherService(decodedToken);
    req.gatherServiceInstance = gatherServiceInstance;
    next();
  }
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { gatherServiceInstance } = req;
    if (!gatherServiceInstance) throw new Error();

    const gatherData = await gatherServiceInstance.getGather();
    res.status(200).json(gatherData);
  })
  .post(async (req, res, next) => {
    const { gatherServiceInstance } = req;
    if (!gatherServiceInstance) throw new Error();

    const { gather } = req.body;

    console.log(gather);

    await gatherServiceInstance.createGather(gather);
    res.status(200).end();
  });

module.exports = router;
