import express, { NextFunction, Request, Response } from "express";
import AdminManageService from "../../services/adminManageService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const { decodedToken } = req;

  const adminManageInstance = new AdminManageService(decodedToken);
  req.adminManageInstance = adminManageInstance;
  next();
});

router
  .route("/dayCalc")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { adminManageInstance } = req;

    try {
      await adminManageInstance?.absenceManage();
    } catch (err) {
      next(err);
    }

    return res.status(200).end();
  });

router
  .route("/monthCalc")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { adminManageInstance } = req;

    try {
      await adminManageInstance?.monthCalc();
    } catch (err) {
      next(err);
    }

    return res.status(200).json("SUCCESS");
  });

module.exports = router;
