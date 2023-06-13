import { Response, Request, NextFunction } from "express";

const logger = require("../../logger");

function logErrors(err: any, req: Request, res: Response, next: NextFunction) {
  logger.logger.info(err, {
    metadata: { type: "error", uid: -1, value: -1 },
  });
  next();
}
