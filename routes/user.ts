import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
const jwt = require("jsonwebtoken");

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);

  const token2 = await decode({
    token,
    secret: "klajsdflksjdflkdvdssdq231e1w",
  });

  // jwt.verify(
  //   token,
  //   "klajsdflksjdflkdvdssdq231e1w",
  //   (err: any, decoded: any) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log(decoded);
  //     }
  //   }
  // );
  next();
});

router.get("/", (req: Request, res: Response) => {
  res.send("okay");
});

router
  .route("/point")
  .get(async (req: Request, res: Response) => {
    res.send("okay");
  })
  .post((req: Request, res: Response) => {
    console.log("hello");

    res.send("okay");
  });

module.exports = router;
