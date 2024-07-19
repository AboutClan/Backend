import { Request } from "express";
import { JWT } from "next-auth/jwt";
import AdminLogService from "../services/adminLogService";
import adminManageService from "../services/adminManageService";
import AdminUserService from "../services/adminUserServices";
import AdminVoteService from "../services/adminVoteServices";
import BookService from "../services/bookService";
import CollectionService from "../services/collectionService";
import CounterService from "../services/counterService";
import DailyCheckService from "../services/dailyCheckService";
import FcmService from "../services/fcmService";
import FeedService from "../services/feedService";
import GatherService from "../services/gatherService";
import StoreService from "../services/giftService";
import GroupStudyService from "../services/groupStudyService";
import LogService from "../services/logService";
import NoticeService from "../services/noticeService";
import PlaceService from "../services/placeService";
import PromotionService from "../services/promotionService";
import RegisterService from "../services/registerService";
import RequestService from "../services/requestService";
import SquareService from "../services/squareService";
import UserService from "../services/userService";
import VoteService from "../services/voteService";
import WebPushService from "../services/webPushService";

export interface tokenRequest extends Request {
  token: JWT | null;
}

declare global {
  namespace Express {
    export interface Request {
      decodedToken: any;
      token?: JWT;
      date?: Date;
      userServiceInstance?: UserService;
      voteServiceInstance?: VoteService;
      placeServiceInstance?: PlaceService;
      requestServiceInstance?: RequestService;
      squareServiceInstance?: SquareService;
      bookServiceInstance?: BookService;
      giftServiceInstance?: StoreService;
      noticeServiceInstance?: NoticeService;
      dailyCheckServiceInstance?: DailyCheckService;
      counterServiceInstance?: CounterService;
      collectionServiceInstance?: CollectionService;
      gatherServiceInstance?: GatherService;
      groupStudyServiceInstance?: GroupStudyService;
      registerServiceInstance?: RegisterService;
      adminLogServiceInstance?: AdminLogService;
      adminUserServiceInstance?: AdminUserService;
      adminVoteServiceInstance?: AdminVoteService;
      adminManageInstance?: adminManageService;
      logServiceInstance?: LogService;
      imageServiceInstance?: ImageService;
      promotionServiceInstance?: PromotionService;
      webPushServiceInstance?: WebPushService;
      feedServiceInstance?: FeedService;
      fcmServiceInstance?: FcmService;
    }
  }
}
