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

    const requestData = await requestServiceInstance.getRequest();
    res.status(200).json(requestData);
  })
  .post(async (req, res, next) => {
    const { requestServiceInstance } = req;
    if (!requestServiceInstance) throw new Error();

    const { request } = req.body;

    console.log(request);

    await requestServiceInstance.createRequest(request);
    res.status(200).end();
  });

module.exports = router;
