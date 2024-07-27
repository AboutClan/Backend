import { NextFunction, Request, Response, Router } from "express";
import MessageService from "../services/messageService";

class MessageController {
  public router: Router;
  private messageServiceInstance: MessageService;

  constructor() {
    this.router = Router();
    this.messageServiceInstance = new MessageService();
    this.initializeRoutes();
  }

  public setMessageServiceInstance(instance: MessageService) {
    this.messageServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createMessageServiceInstance.bind(this));
  }

  private async createMessageServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const messageService = new MessageService(decodedToken);
    this.setMessageServiceInstance(messageService);
    next();
  }
}
const messageController = new MessageController();
module.exports = messageController.router;
