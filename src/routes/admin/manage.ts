import express, { NextFunction, Request, Response } from "express";
import AdminManageService from "../../services/adminManageService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const adminManageInstance = new AdminManageService();
  req.adminManageInstance = adminManageInstance;
  next();
});

router
  .route("/dayCalc")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { adminManageInstance } = req;

    try {
      adminManageInstance?.absenceManage();
    } catch (err) {
      next(err);
    }

    return res.status(200).end();
  });
router.route("/monthCalc").delete(async (req, res, next) => {});

module.exports = router;
