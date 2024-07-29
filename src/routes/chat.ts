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

    this.router
      .route("/")
      .post(this.createChat.bind(this))
      .get(this.getChat.bind(this));
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

  private async getChat(req: Request, res: Response, next: NextFunction) {
    const { toUid, cursor } = req.query as { toUid: string; cursor: string };

    try {
      const chatList = await this.chatServiceInstance.getChat(toUid);
      console.log(chatList);

      return res.status(200).json(chatList);
    } catch (err: any) {
      next(err);
    }
  }

  private async createChat(req: Request, res: Response, next: NextFunction) {
    const { toUid, message } = req.body;

    try {
      await this.chatServiceInstance.createChat(toUid, message);

      return res.status(200).end();
    } catch (err: any) {
      next(err);
    }
  }
}
const chatController = new ChatController();
module.exports = chatController.router;
