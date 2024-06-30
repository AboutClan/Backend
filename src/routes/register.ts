import express, { NextFunction, Request, Response, Router } from "express";
import RegisterService from "../services/registerService";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";

const router = express.Router();

class RegisterController {
  public router: Router;
  private registerServiceInstance: RegisterService;

  constructor() {
    this.router = Router();
    this.registerServiceInstance = new RegisterService();
    this.initializeRoutes();
  }

  public setRegisterServiceInstance(instance: RegisterService) {
    this.registerServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createRegisterServiceInstance.bind(this));

    this.router
      .route("/")
      .get(this.getRegisteredUsers.bind(this))
      .post(this.registerUser.bind(this));

    this.router
      .route("/approval")
      .post(
        body("uid").notEmpty().withMessage("uid필요"),
        validateCheck,
        this.approveUser.bind(this),
      )
      .delete(
        body("uid").notEmpty().withMessage("uid필요"),
        validateCheck,
        this.deleteUser.bind(this),
      );
  }

  private async createRegisterServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const plazaService = new RegisterService(decodedToken);
    this.setRegisterServiceInstance(plazaService);
    next();
  }

  private async getRegisteredUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const registeredUsers = await this.registerServiceInstance?.getRegister();
      return res.status(200).json(registeredUsers);
    } catch (err: any) {
      next(err);
    }
  }

  private async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const registerForm = req.body;
      await this.registerServiceInstance?.register(registerForm);
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async approveUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { uid },
      } = req;
      await this.registerServiceInstance?.approve(uid);
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }

  private async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { uid },
      } = req;
      await this.registerServiceInstance?.deleteRegisterUser(uid, null);
      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
}

const registerController = new RegisterController();
module.exports = registerController.router;
