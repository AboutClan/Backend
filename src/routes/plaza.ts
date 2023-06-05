import express, { NextFunction, Request, Response, Router } from "express";
import { decode } from "next-auth/jwt";
import PlazaService from "../services/plazaService";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const plazaServiceInstance = new PlazaService();
  req.plazaServiceInstance = plazaServiceInstance;
  next();
});

router.route("/").get(async (req, res, next) => {
  const { plazaServiceInstance } = req;
  if (!plazaServiceInstance) throw new Error();

  const plazaData = await plazaServiceInstance.getPlaza();
  res.status(200).json(plazaData);
});

router.route("/").post(async (req, res, next) => {
  const { plazaServiceInstance } = req;
  if (!plazaServiceInstance) throw new Error();

  const { plaza } = req.body;

  const plazaData = await plazaServiceInstance.createPlaza(plaza);
  res.status(200).json(plazaData);
});

module.exports = router;
