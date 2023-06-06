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
  if (!adminLogServiceInstance) throw new Error();

  const { day } = req.params;

  await adminLogServiceInstance.deleteLog(parseInt(day));
  return res.status(200).end();
});

module.exports = router;
