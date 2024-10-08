import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import RealtimeService from "../services/realtimeService";

// multer 설정: 메모리에 파일 저장 (또는 `dest` 옵션을 사용하여 디스크에 저장)
const upload = multer({ storage: multer.memoryStorage() });

class StudyController {
  public router: Router;
  private realtimeServiceInstance: RealtimeService;

  constructor() {
    this.router = Router();
    this.realtimeServiceInstance = new RealtimeService();
    this.initializeRoutes();
  }

  public setStudyServiceInstance(instance: RealtimeService) {
    this.realtimeServiceInstance = instance;
  }

  private initializeRoutes() {
    this.router.use("/", this.createStudyServiceInstance.bind(this));
    this.router
      .route("/")
      .get(this.getRealtime.bind(this))
      .patch(this.updateStudy.bind(this));
    this.router.route("/basicVote").post(this.createBasicVote.bind(this));

    this.router
      .route("/attendance")
      .post(upload.array("images", 5), this.markAttendance.bind(this));

    this.router
      .route("/directAttendance")
      .post(upload.array("images", 5), this.directAttendance.bind(this));
  }

  private async createStudyServiceInstance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { decodedToken } = req; // decodedToken이 req 객체에 존재한다고 가정
    const studyService = new RealtimeService(decodedToken);
    this.setStudyServiceInstance(studyService);
    next();
  }

  private async createBasicVote(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const studyData = req.body;

      const newStudy =
        await this.realtimeServiceInstance.createBasicVote(studyData);
      return res.status(201).json(newStudy);
    } catch (err: any) {
      next(err);
    }
  }

  private async getRealtime(req: Request, res: Response, next: NextFunction) {
    try {
      const realtime = await this.realtimeServiceInstance.getRecentStudy();
      return res.status(200).json(realtime);
    } catch (err: any) {
      next(err);
    }
  }

  private async markAttendance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const studyData = req.body;

      let buffers: Buffer[] = [];

      if (req.files && Array.isArray(req.files)) {
        buffers = req.files.map((file: Express.Multer.File) => file.buffer);
      }

      const updatedStudy = await this.realtimeServiceInstance.markAttendance(
        studyData,
        buffers,
      );
      return res.status(200).json(updatedStudy);
    } catch (err: any) {
      next(err);
    }
  }

  private async directAttendance(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const studyData = req.body;

      let buffers: Buffer[] = [];

      if (req.files && Array.isArray(req.files)) {
        buffers = req.files.map((file: Express.Multer.File) => file.buffer);
      }

      const newStudy = await this.realtimeServiceInstance.directAttendance(
        studyData,
        buffers,
      );
      return res.status(201).json(newStudy);
    } catch (err: any) {
      next(err);
    }
  }

  private async updateStudy(req: Request, res: Response, next: NextFunction) {
    try {
      const studyData = req.body;

      const updatedStudy =
        await this.realtimeServiceInstance.updateStudy(studyData);
      if (updatedStudy) {
        return res.status(200).json(updatedStudy);
      } else {
        return res.status(404).json({ message: "Study not found" });
      }
    } catch (err: any) {
      next(err);
    }
  }
}

const studyController = new StudyController();
module.exports = studyController.router;
