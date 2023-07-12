import { Response, Request, NextFunction } from "express";

const { body, validationResult } = require("express-validator");

export default function validateCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  console.log(errors);
  if (errors.isEmpty()) {
    return next();
  }

  let extractedErrors = "";

  errors.array().map((err: any) => {
    extractedErrors += `${err.path}: ${err.msg}`;
  });

  next(extractedErrors);
}
