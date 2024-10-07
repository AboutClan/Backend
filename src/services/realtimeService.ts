import { JWT } from "next-auth/jwt";
import {
  IRealtime,
  IRealtimeUser,
  RealtimeAttZodSchema,
  RealtimeModel,
  RealtimeUserZodSchema,
} from "../db/models/realtime";
import { DatabaseError } from "../errors/DatabaseError"; // 에러 처리 클래스 (커스텀 에러)
import ImageService from "./imageService";

export default class RealtimeService {
  private token: JWT;
  private imageServiceInstance: ImageService;

  constructor(token?: JWT) {
    this.token = token as JWT;
    this.imageServiceInstance = new ImageService(token);
  }

  getToday() {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0); // 시간을 0시 0분 0초 0밀리초로 설정
    return todayMidnight;
  }

  async getTodayData() {
    const date = this.getToday();
    const data = await RealtimeModel.findOne({ date });

    if (!data) {
      return await RealtimeModel.create({ date });
    }

    return data;
  }

  // 기본 투표 생성
  async createBasicVote(studyData: Partial<IRealtime>) {
    // 데이터 유효성 검사
    const validatedStudy = RealtimeUserZodSchema.parse({
      ...studyData,
      status: "pending",
      user: this.token.id,
    });

    const todayRealtime = await this.getTodayData();

    const isDuplicate = todayRealtime.userList?.some(
      (item) => item.user == validatedStudy.user,
    );

    if (!isDuplicate) {
      await todayRealtime.userList?.push(validatedStudy);
      await todayRealtime.save();
    }

    return todayRealtime;
  }

  // 출석 상태로 변경
  async markAttendance(studyData: Partial<IRealtimeUser>) {
    // 데이터 유효성 검사
    console.log("study", studyData, studyData.memo);

    if (studyData.image) {
      const images = await this.imageServiceInstance.uploadImgCom(
        "studyAttend",
        studyData.image as Buffer[],
      );

      studyData.image = images;
    }
    const validatedStudy = RealtimeAttZodSchema.parse(studyData);

    const todayData = await this.getTodayData();

    todayData.userList?.forEach((user) => {
      if (
        (user.user as unknown as String) == this.token.id &&
        user.status == "pending"
      ) {
        user.arrived = new Date();
        user.status = studyData.status || "solo";
        user.image = studyData.image;
      }
    });
    await todayData.save();

    return todayData;
  }

  // 정보를 포함한 직접 출석
  async directAttendance(studyData: Partial<IRealtime>) {
    // 데이터 유효성 검사
    const validatedStudy = RealtimeUserZodSchema.parse({
      ...studyData,
      arrived: new Date(),
      user: this.token.id,
    });

    const todayData = await this.getTodayData();

    const isDuplicate = todayData.userList?.some(
      (item) => item.user == validatedStudy.user,
    );

    if (!isDuplicate) {
      await todayData.userList?.push(validatedStudy);
      await todayData.save();
    }

    // return todayData;
  }

  // 스터디 정보 업데이트
  async updateStudy(studyData: Partial<IRealtime>) {
    // 데이터 유효성 검사

    const updatedRealtime = await RealtimeModel.findOneAndUpdate(
      {
        date: this.getToday(), // date 필드가 일치하는 문서 찾기
        "userList.user": this.token.id, // userList 배열 내의 user 필드가 일치하는 문서 찾기
      },
      {
        $set: {
          "userList.$[elem]": studyData, // 배열 내 특정 요소 업데이트
        },
      },
      {
        arrayFilters: [{ "elem.user": this.token.id }], // 배열 필터: user 필드가 일치하는 요소만 업데이트
        new: true, // 업데이트된 문서를 반환
      },
    );

    if (!updatedRealtime) throw new DatabaseError("Failed to update study");
    return updatedRealtime;
  }

  // 가장 최근의 스터디 가져오기
  async getRecentStudy() {
    return this.getTodayData();
  }
}
