import express, { NextFunction, Request, Response, Router } from "express";
import PlazaService from "../services/plazaService";
import validateCheck from "../middlewares/validator";
import { body } from "express-validator";

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
  .post(
    body("plaza").isEmpty().withMessage("plaza필요"),
    validateCheck,
    async (req, res, next) => {
      const {
        plazaServiceInstance,
        body: { plaza },
      } = req;

      try {
        await plazaServiceInstance?.createPlaza(plaza);
        res.status(200).end();
      } catch (err: any) {
        next(err);
      }
    }
  );

module.exports = router;
