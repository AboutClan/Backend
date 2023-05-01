import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import { strToDate } from "../utils/dateUtils";

const router = express.Router();

router.use(
  "/:date",
  async (req: Request, res: Response, next: NextFunction) => {
    const { date: dateStr } = req.params;
    const dayjsDate = strToDate(dateStr);
    const date = dayjsDate.toDate();

    const token = req.headers.authorization?.split(" ")[1];

    const decodedToken = await decode({
      token,
      secret: "klajsdflksjdflkdvdssdq231e1w",
    });

    if (!decodedToken) {
      return res.status(401).send("Unauthorized");
    } else {
      console.log(req.url);
      req.token = decodedToken;
      next();
    }
  }
);

router
  .route("/arrived")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    console.log(21);
    const { token } = req;
    console.log(2, token);
    return res.status(200).send();
    if (!token) return res.status(401).send("Unauthorized");
  });

module.exports = router;
