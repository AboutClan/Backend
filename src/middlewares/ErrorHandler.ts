import { NextFunction, Request, Response } from "express";

const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  } else {
    console.log("Unexpected Error: ", err);
    res.status(500).json({
      success: false,
      message: "An unexpected error occured",
    });
  }
};

export default ErrorHandler;
