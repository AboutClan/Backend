import express, { NextFunction, Request, Response } from "express";
import BookService from "../services/bookService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const bookServiceInstance = new BookService();
  req.bookServiceInstance = bookServiceInstance;
  next();
});

module.exports = router;
