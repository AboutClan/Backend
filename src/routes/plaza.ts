import express, { NextFunction, Request, Response, Router } from "express";
import { decode } from "next-auth/jwt";
import PlazaService from "../services/plazaService";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const plazaServiceInstance = new PlazaService();
  req.plazaServiceInstance = plazaServiceInstance;
  next();
});

export default router;
