import express, { NextFunction, Request, Response } from "express";
import BookService from "../services/bookService";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const bookServiceInstance = new BookService();
  req.bookServiceInstance = bookServiceInstance;
  next();
});

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { bookServiceInstance } = req;
    if (!bookServiceInstance) throw new Error();

    const bookList = await bookServiceInstance.getBookList();
    res.status(200).send(bookList);
  });

module.exports = router;
