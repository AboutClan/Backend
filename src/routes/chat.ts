import { NextFunction, Request, Response, Router } from "express";
import ChatService from "../services/chatService";

class ChatController {
  public router: Router;
  private chatServiceInstance: ChatService;

  constructor() {
    this.router = Router();
    this.chatServiceInstance = new ChatService();
    this.initializeRoutes();
  }

  public setChatServiceInstance(instance: ChatService) {
    this.chatServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createChatServiceInstance.bind(this));

    this.router.post("/", this.createChat.bind(this));
  }

  private async createChatServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const chatService = new ChatService(decodedToken);
    this.setChatServiceInstance(chatService);
    next();
  }

  private async createChat(req: Request, res: Response, next: NextFunction) {
    const { toUid, message } = req.body;

    await this.chatServiceInstance.createChat(toUid, message);

    return res.status(200).end();
  }
}
const chatController = new ChatController();
module.exports = chatController.router;
