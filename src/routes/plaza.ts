import express, { NextFunction, Request, Response, Router } from "express";
import PlazaService from "../services/plazaService";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const plazaServiceInstance = new PlazaService();
  req.plazaServiceInstance = plazaServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { plazaServiceInstance } = req;
    if (!plazaServiceInstance) throw new Error();

    try {
      const plazaData = await plazaServiceInstance.getPlaza();
      res.status(200).json(plazaData);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    const { plazaServiceInstance } = req;
    if (!plazaServiceInstance) throw new Error();

    const { plaza } = req.body;

    try {
      await plazaServiceInstance.createPlaza(plaza);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
