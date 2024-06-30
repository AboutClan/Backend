import express, { NextFunction, Request, Response, Router } from "express";
import BookService from "../services/bookService";

class BookController {
  public router: Router;
  private bookServiceInstance;

  constructor() {
    this.router = Router();
    this.bookServiceInstance = new BookService();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getBookList.bind(this));
  }

  private async getBookList(req: Request, res: Response, next: NextFunction) {
    try {
      const bookList = await this.bookServiceInstance?.getBookList();
      res.status(200).send(bookList);
    } catch (err: any) {
      next(err);
    }
  }
}

const bookController = new BookController();
module.exports = bookController.router;
