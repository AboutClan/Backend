import express, { NextFunction, Request, Response } from "express";
import AdminLogService from "../../services/adminLogService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const adminLogServiceInstance = new AdminLogService();
  req.adminLogServiceInstance = adminLogServiceInstance;
  next();
});

router.route("/delete/:day").delete(async (req, res, next) => {
  const { adminLogServiceInstance } = req;

  const { day } = req.params;

  console.log(day);

  await adminLogServiceInstance?.deleteLog(parseInt(day));
  return res.status(200).end();
});

module.exports = router;
