import { NextFunction, Request, Response } from "express";
import dbConnect from "../db/conn";

export const dbSet = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  await dbConnect();
  next();
};
