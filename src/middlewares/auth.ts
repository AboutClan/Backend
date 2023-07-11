import { Response, Request, NextFunction } from "express";
import { decode } from "next-auth/jwt";

export default async function tokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token?.toString() == "undefined" || !token) return next("no token");

    const decodedToken = await decode({
      token,
      secret: "klajsdflksjdflkdvdssdq231e1w",
    });

    if (!decodedToken) next("no token");

    req.decodedToken = decodedToken;
    next();
  } catch (err) {
    next(err);
  }
}
