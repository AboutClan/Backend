import express, { NextFunction, Request, Response } from "express";
import AdminUserService from "../../services/adminUserServices";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const adminUserServiceInstance = new AdminUserService();
  req.adminUserServiceInstance = adminUserServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  });

router
  .route("/point")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  });

router
  .route("/score")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  });

router
  .route("/:id/info")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  });

router
  .route("/:id/role")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { adminUserServiceInstance } = req;
    if (!adminUserServiceInstance) throw new Error();
  });
module.exports = router;
