import { Express } from "express-serve-static-core";
import { Request } from "express";
import { JWT } from "next-auth/jwt";
import UserService from "../services/userService";
import VoteService from "../services/voteService";
import BookService from "../services/bookService";
import RequestService from "../services/requestService";
import PlaceService from "../services/placeService";
import AdminUserService from "../services/adminUserServices";
import AdminVoteService from "../services/adminVoteServices";
import StoreService from "../services/giftService";
import RegisterService from "../services/registerService";
import LogService from "../services/logService";
import AdminLogService from "../services/adminLogService";
import GatherService from "../services/gatherService";
import PlazaService from "../services/plazaService";

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
      plazaServiceInstance?: PlazaService;
      bookServiceInstance?: BookService;
      giftServiceInstance?: StoreService;
      gatherServiceInstance?: GatherService;
      registerServiceInstance?: RegisterService;
      adminLogServiceInstance?: AdminLogService;
      adminUserServiceInstance?: AdminUserService;
      adminVoteServiceInstance?: AdminVoteService;
      logServiceInstance?: LogService;
    }
  }
}
