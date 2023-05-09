import { Express } from "express-serve-static-core";
import { Request } from "express";
import { JWT } from "next-auth/jwt";
import UserService from "../services/userService";
import VoteService from "../services/voteService";

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
    }
  }
}
