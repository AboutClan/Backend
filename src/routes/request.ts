import express, { NextFunction, Request, Response, Router } from "express";
import { decode } from "next-auth/jwt";
import RequestService from "../services/requestService";

const router: Router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const rqeuestServiceInstance = new RequestService();
  req.requestServiceInstance = rqeuestServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req, res, next) => {
    const { requestServiceInstance } = req;
    if (!requestServiceInstance) throw new Error();

    try {
      const requestData = await requestServiceInstance.getRequest();
      res.status(200).json(requestData);
    } catch (err: any) {
      next(err);
    }
  })
  .post(async (req, res, next) => {
    const {
      requestServiceInstance,
      body: { request },
    } = req;

    try {
      await requestServiceInstance?.createRequest(request);
      res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  });

module.exports = router;
