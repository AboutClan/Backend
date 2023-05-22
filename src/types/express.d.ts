import { Express } from "express-serve-static-core";
import { Request } from "express";
import { JWT } from "next-auth/jwt";
import UserService from "../services/userService";
import VoteService from "../services/voteService";
import BookService from "../services/bookService";
import PlazaService from "../services/plazaService";
import PlaceService from "../services/placeService";
import AdminUserService from "../services/adminUserServices";
import AdminVoteService from "../services/adminVoteServices";
import StoreService from "../services/giftService";
import RegisterService from "../services/registerService";

export interface tokenRequest extends Request {
  token: JWT | null;
}

declare global {
  namespace Express {
    export interface Request {
      token?: JWT;
      date?: Date;
      userServiceInstance?: UserService;
      voteServiceInstance?: VoteService;
      placeServiceInstance?: PlaceService;
      plazaServiceInstance?: PlazaService;
      bookServiceInstance?: BookService;
      giftServiceInstance?: StoreService;
      registerServiceInstance?: RegisterService;
      adminUserServiceInstance?: AdminUserService;
      adminVoteServiceInstance?: AdminVoteService;
    }
  }
}
