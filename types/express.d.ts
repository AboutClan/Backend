import { Express } from "express-serve-static-core";
import { Request } from "express";
import { JWT } from "next-auth/jwt";

export interface tokenRequest extends Request {
  token: JWT | null;
}

declare global {
  namespace Express {
    export interface Request {
      token?: JWT;
    }
  }
}
