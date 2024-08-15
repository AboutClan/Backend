import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { ValidationError } from "../errors/ValidationError";

const ErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
  } else {
    console.log("Unexpected Error Occured!: ", err);
    res.status(500).json({
      success: false,
      message: "An unexpected error occured",
    });
  }
};

export default ErrorHandler;
