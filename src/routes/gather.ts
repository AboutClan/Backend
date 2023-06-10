import express, { NextFunction, Request, Response, Router } from "express";
import { decode } from "next-auth/jwt";
import PlazaService from "../services/plazaService";
import GatherService from "../services/gatherService";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const gatherServiceInstance = new GatherService();
  req.gatherServiceInstance = gatherServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { gatherServiceInstance } = req;
    if (!gatherServiceInstance) throw new Error();

    const plazaData = await gatherServiceInstance.getGather();
    res.status(200).json(plazaData);
  })
  .post(async (req, res, next) => {
    const { gatherServiceInstance } = req;
    if (!gatherServiceInstance) throw new Error();

    const gather = req.body;

    console.log(gather);

    await gatherServiceInstance.createGather(gather);
    res.status(200).end();
  });

module.exports = router;
