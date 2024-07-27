import express, { NextFunction, Request, Response, Router } from "express";
import { body } from "express-validator";
import validateCheck from "../middlewares/validator";
import UserService from "../services/userService";

const router = express.Router();

class UserController {
  public router: Router;
  private userServiceInstance: UserService;

  constructor() {
    this.router = Router();
    this.userServiceInstance = new UserService();
    this.initializeRoutes();
  }

  public setUserServiceInstance(instance: UserService) {
    this.userServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createUserServiceInstance.bind(this));

    this.router.get("/active", this.getActive.bind(this));
    this.router.get("/simple", this.getSimple.bind(this));
    this.router.get("/simpleAll", this.getAllSimple.bind(this));
    this.router
      .route("/avatar")
      .get(this.getAvatar.bind(this))
      .patch(
        validateCheck,
        body("type").notEmpty().withMessage("Type is required."),
        body("bg").notEmpty().withMessage("Background is required."),
        this.updateAvatar.bind(this),
      );
    this.router
      .route("/comment")
      .get(this.getAllComments.bind(this))
      .patch(
        validateCheck,
        body("comment").notEmpty().withMessage("Comment is required."),
        this.updateComment.bind(this),
      );
    this.router
      .route("/instagram")
      .get(this.getAllComments.bind(this))
      .patch(
        validateCheck,
        body("instagram").notEmpty().withMessage("instagramId is required."),
        this.updateInstagram.bind(this),
      );
    this.router.patch(
      "/role",
      body("role").notEmpty().withMessage("Role is required."),
      this.patchRole.bind(this),
    );
    this.router.patch("/isPrivate", this.patchIsPrivate.bind(this));

    this.router.patch("/rest", this.patchRest.bind(this));
    this.router.get(
      "/participationrate/all",
      this.getParticipationRateAll.bind(this),
    );
    this.router.get("/participationrate", this.getParticipationRate.bind(this));
    this.router.get("/voterate", this.getVoteRate.bind(this));
    this.router
      .route("/profile")
      .get(this.getProfile.bind(this))
      .post(this.updateProfile.bind(this))
      .patch(this.patchProfile.bind(this));
    this.router.get("/profile/:uid", this.getUserByUid.bind(this));

    this.router.route("/profiles").get(this.getUsersWithUids.bind(this));
    this.router.patch("/changeInactive", this.setUserInactive.bind(this));
    this.router
      .route("/point")
      .get(this.getUserPoint.bind(this))
      .patch(this.updateUserPoint.bind(this));
    this.router
      .route("/score")
      .get(this.getUserScore.bind(this))
      .patch(this.updateUserScore.bind(this));
    this.router.get("/histories/score", this.getScoreLogs.bind(this));
    this.router.get("/histories/monthScore", this.getMonthScoreLogs.bind(this));
    this.router.get("/histories/score/all", this.getAllScoreLogs.bind(this));
    this.router.get("/histories/point", this.getPointLogs.bind(this));
    this.router.get("/histories/point/all", this.getAllPointLogs.bind(this));
    this.router
      .route("/monthScore")
      .get(this.getMonthScore.bind(this))
      .delete(this.initMonthScore.bind(this));
    this.router
      .route("/deposit")
      .get(this.getUserDeposit.bind(this))
      .patch(this.updateUserDeposit.bind(this));
    this.router
      .route("/score/all")
      .get(this.getAllUserScores.bind(this))
      .patch(this.updateAllUserScores.bind(this));
    this.router.route("/deposit/all").get(this.getAllUserDeposits.bind(this));

    this.router
      .route("/preference")
      .post(
        body("place").notEmpty().withMessage("place 입력 필요."),
        this.setPreference.bind(this),
      )
      .get(this.getPreference.bind(this));

    this.router
      .route("/promotion")
      .get(this.getPromotion.bind(this))
      .post(
        body("name").notEmpty().withMessage("name 입력 필요."),
        this.setPromotion.bind(this),
      );

    this.router
      .route("/friend")
      .get(this.getFriend.bind(this))
      .patch(this.setFriend.bind(this))
      .delete(
        body("toUid").notEmpty().isString().withMessage("toUid 필요"),
        this.deleteFriend.bind(this),
      );

    this.router
      .route("/belong")
      .patch(
        body("uid").notEmpty().withMessage("uid 입력 필요."),
        body("belong").notEmpty().withMessage("belong 입력 필요."),
        this.patchBelong.bind(this),
      );

    this.router.route("/test").get(this.test.bind(this));
  }

  private async createUserServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req;
    const userServiceInstance = new UserService(decodedToken);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    this.setUserServiceInstance(userServiceInstance);
    next();
  }

  private getActive = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const isActive = await this.userServiceInstance.getUserInfo(["isActive"]);
      res.status(200).json(isActive);
    } catch (err) {
      next(err);
    }
  };

  private getSimple = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const simpleUserInfo = await this.userServiceInstance.getSimpleUserInfo();
      res.status(200).json(simpleUserInfo);
    } catch (err) {
      next(err);
    }
  };

  private getAllSimple = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const allSimpleUserInfo =
        await this.userServiceInstance.getAllSimpleUserInfo();
      res.status(200).json(allSimpleUserInfo);
    } catch (err) {
      next(err);
    }
  };

  private getAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const avatar = await this.userServiceInstance.getUserInfo(["avatar"]);
      res.status(200).json(avatar);
    } catch (err) {
      next(err);
    }
  };

  private updateAvatar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { type, bg } = req.body;
      await this.userServiceInstance.updateUser({ avatar: { type, bg } });
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getAllComments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const comments = await this.userServiceInstance.getAllUserInfo([
        "comment",
        "name",
      ]);
      res.status(200).json({ comments });
    } catch (err) {
      next(err);
    }
  };

  private updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { comment } = req.body;
      await this.userServiceInstance.updateUser({ comment });
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private updateInstagram = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { instagram } = req.body;
      await this.userServiceInstance.updateUser({ instagram });
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private patchRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { role } = req.body;
      await this.userServiceInstance.patchRole(role);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  };
  private patchIsPrivate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { isPrivate } = req.body;
      await this.userServiceInstance.patchIsPrivate(isPrivate);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private patchRest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { info = "" },
    } = req;
    try {
      await this.userServiceInstance?.setRest(info);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getParticipationRateAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      startDay,
      endDay,
      location,
      summary,
    }: {
      startDay: string;
      endDay: string;
      location: string | null;
      summary: boolean;
    } = req.query as any;
    try {
      const participationResult =
        await this.userServiceInstance?.getParticipationRate(
          startDay,
          endDay,
          true,
          location,
          Boolean(summary),
        );
      return res.status(200).json(participationResult);
    } catch (err) {
      next(err);
    }
  };

  private getParticipationRate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      startDay,
      endDay,
      location,
      summary,
    }: {
      startDay: string;
      endDay: string;
      location: string | null;
      summary: boolean;
    } = req.query as any;
    try {
      const participationResult =
        await this.userServiceInstance?.getParticipationRate(
          startDay,
          endDay,
          false,
          location,
          summary,
        );
      const userResult = participationResult?.[0];
      return res.status(200).json(userResult);
    } catch (err) {
      next(err);
    }
  };

  private getVoteRate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { startDay, endDay }: { startDay: string; endDay: string } =
      req.query as any;
    try {
      const voteResult = await this.userServiceInstance?.getVoteRate(
        startDay,
        endDay,
      );
      return res.status(200).json(voteResult);
    } catch (err) {
      next(err);
    }
  };

  private getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const targetUser = await this.userServiceInstance?.getUserInfo([]);
      return res.status(200).json(targetUser);
    } catch (err) {
      next(err);
    }
  };

  private updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const registerForm = req.body || {};
    try {
      await this.userServiceInstance?.updateUser(registerForm);
      const updatedUser = await this.userServiceInstance?.getUserInfo([]);
      return res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  };

  private patchProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const updatedUser = await this.userServiceInstance?.patchProfile();
      return res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  };

  private getUserByUid = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { uid } = req.params;
    try {
      const isActive = await this.userServiceInstance?.getUserWithUid(uid);
      return res.status(200).json(isActive);
    } catch (err) {
      next(err);
    }
  };

  private getUsersWithUids = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { uids } = req.query;

    try {
      const results = await this.userServiceInstance?.getUsersWithUids(
        uids as string[],
      );
      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };

  private setUserInactive = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const results = await this.userServiceInstance?.setUserInactive();
      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  };

  private getUserPoint = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userPoint = await this.userServiceInstance?.getUserInfo(["point"]);
      return res.status(200).send(userPoint);
    } catch (err) {
      next(err);
    }
  };

  private updateUserPoint = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { point, message = "", sub },
    } = req;

    try {
      await this.userServiceInstance?.updatePoint(point, message, sub);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getUserScore = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userScore = await this.userServiceInstance?.getUserInfo(["score"]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  };

  private updateUserScore = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { score, message, sub },
    } = req;

    try {
      await this.userServiceInstance?.updateScore(score, message, sub);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getScoreLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const logs = await this.userServiceInstance?.getLog("score");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  };

  private getMonthScoreLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const logs = await this.userServiceInstance?.getMonthScoreLog();
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  };

  private getAllScoreLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const logs = await this.userServiceInstance?.getAllLog("score");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  };

  private getPointLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const logs = await this.userServiceInstance?.getLog("point");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  };

  private getAllPointLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const logs = await this.userServiceInstance?.getAllLog("point");
      return res.status(200).json(logs);
    } catch (err: any) {
      next(err);
    }
  };

  private getMonthScore = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userScore = await this.userServiceInstance?.getUserInfo([
        "monthScore",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  };

  private initMonthScore = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.userServiceInstance?.initMonthScore();
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getUserDeposit = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userScore = await this.userServiceInstance?.getUserInfo([
        "deposit",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  };

  private updateUserDeposit = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { deposit, message, sub },
    } = req;

    try {
      await this.userServiceInstance?.updateDeposit(deposit, message, sub);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getAllUserScores = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userScore = await this.userServiceInstance?.getAllUserInfo([
        "name",
        "score",
        "location",
        "uid",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  };

  private updateAllUserScores = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.userServiceInstance?.updateUserAllScore();
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getAllUserDeposits = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userScore = await this.userServiceInstance?.getAllUserInfo([
        "name",
        "deposit",
        "uid",
      ]);
      return res.status(200).send(userScore);
    } catch (err) {
      next(err);
    }
  };

  private setPreference = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { place, subPlace = [] },
    } = req;

    try {
      await this.userServiceInstance?.setPreference(place, subPlace);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getPreference = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.userServiceInstance?.getPreference();
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  private getPromotion = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const promotionData = await this.userServiceInstance?.getPromotion();
      return res.status(200).json(promotionData);
    } catch (err) {
      next(err);
    }
  };

  private setPromotion = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        body: { name },
      } = req;

      await this.userServiceInstance?.setPromotion(name);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private getFriend = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const friend = await this.userServiceInstance?.getUserInfo(["friend"]);
      return res.status(200).json(friend);
    } catch (err: any) {
      next(err);
    }
  };

  private setFriend = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { toUid },
    } = req;
    try {
      await this.userServiceInstance?.setFriend(toUid);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private deleteFriend = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { toUid },
    } = req;
    try {
      const friend = await this.userServiceInstance?.deleteFriend(toUid);
      return res.status(200).end(friend);
    } catch (err) {
      next(err);
    }
  };

  private patchBelong = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      body: { uid, belong },
    } = req;
    try {
      await this.userServiceInstance?.patchBelong(uid, belong);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  };

  private test = async (req: Request, res: Response, next: NextFunction) => {
    await this.userServiceInstance?.test();
    return res.status(200).end();
  };
}

const userController = new UserController();
module.exports = userController.router;
