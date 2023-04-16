import express, { Request, Response } from "express";

const router = express.Router();

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
