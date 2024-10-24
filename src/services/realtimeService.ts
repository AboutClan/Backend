import dayjs from "dayjs";
import { JWT } from "next-auth/jwt";
import {
  IPlace,
  IRealtime,
  IRealtimeUser,
  RealtimeModel,
  RealtimeUserZodSchema,
} from "../db/models/realtime";
import { IUser, User } from "../db/models/user";
import { DatabaseError } from "../errors/DatabaseError"; // 에러 처리 클래스 (커스텀 에러)
import CollectionService from "./collectionService";
import ImageService from "./imageService";
import VoteService from "./voteService";

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
    const todayData = await this.getTodayData();

    const voteService = new VoteService();
    const isVoting = await voteService.isVoting(this.getToday(), this.token.id);

    if (isVoting) {
      const vote = await voteService.getVote(this.getToday());
      vote.participations = vote.participations.map((participation) => ({
        ...participation,
        attendences: participation.attendences?.filter((attandence) => {
          return (
            (attandence.user as IUser)?.uid.toString() !==
            this.token.uid?.toString()
          );
        }),
      }));
      await vote.save();
    }

    if (todayData?.userList) {
      todayData.userList = todayData.userList.filter(
        (user) => user.user.toString() !== this.token.id,
      );
    }
    // 데이터 유효성 검사
    const validatedStudy = RealtimeUserZodSchema.parse({
      ...studyData,
      status: "pending",
      user: this.token.id,
    });

    const isDuplicate = todayData.userList?.some(
      (item) => item.user == validatedStudy.user,
    );

    if (!isDuplicate) {
      await todayData.userList?.push(validatedStudy);
      await todayData.save();
    }

    return todayData;
  }

  // 출석 상태로 변경

  async markAttendance(studyData: Partial<IRealtimeUser>, buffers: Buffer[]) {
    const todayData = await this.getTodayData();
    const voteService = new VoteService();
    const isVoting = await voteService.isVoting(this.getToday(), this.token.id);

    if (buffers.length) {
      const images = await this.imageServiceInstance.uploadImgCom(
        "studyAttend",
        buffers,
      );

      studyData.image = images[0];
    }

    const validatedStudy = RealtimeUserZodSchema.parse({
      ...studyData,
      time: JSON.parse(studyData.time as unknown as string),
      place: JSON.parse(studyData.place as unknown as string),
      arrived: new Date(),
      user: this.token.id,
    });

    if (isVoting) {
      const vote = await voteService.getVote(this.getToday());
      vote.participations = vote.participations.map((participation) => ({
        ...participation,
        attendences: participation.attendences?.filter((attandence) => {
          return (
            (attandence.user as IUser)?.uid.toString() !==
            this.token.uid?.toString()
          );
        }),
      }));
      await vote.save();
    }

    let hasPrevVote = false;

    const userData = await User.findOne({ uid: this.token.uid });

    if (todayData?.userList) {
      todayData.userList.forEach((user, index) => {
        if (user.user.toString() === this.token.id) {
          const place = JSON.parse(
            studyData.place as unknown as string,
          ) as IPlace;
          if (user.place.address !== place.address) {
            todayData.userList?.splice(index, 1);
          } else {
            hasPrevVote = true;
            if (userData) {
              userData.weekStudyAccumulationMinutes += dayjs(
                user.time.end,
              ).diff(dayjs(), "m");
            }
            user.arrived = new Date();
            user.status = studyData.status || "solo";
            user.image = studyData.image;
            user.memo = studyData.memo;
            user.place = place;
            if (studyData?.time)
              user.time.end = JSON.parse(
                studyData.time as unknown as string,
              ).end;
          }
        }
      });
    }
    await userData?.save();

    if (!hasPrevVote) {
      await todayData.userList?.push(validatedStudy);
      await todayData.save();
    }

    await todayData.save();
    const collection = new CollectionService();
    const result = collection.setCollectionStamp(this.token.id);

    return result;
  }

  // 정보를 포함한 직접 출석
  async directAttendance(studyData: Partial<IRealtimeUser>, buffers: Buffer[]) {
    const voteService = new VoteService();
    const isVoting = await voteService.isVoting(this.getToday(), this.token.id);

    // 데이터 유효성 검사
    const validatedStudy = RealtimeUserZodSchema.parse({
      ...studyData,
      time: JSON.parse(studyData.time as unknown as string),
      place: JSON.parse(studyData.place as unknown as string),
      arrived: new Date(),
      user: this.token.id,
    });

    const todayData = await this.getTodayData();

    if (buffers.length) {
      const images = await this.imageServiceInstance.uploadImgCom(
        "studyAttend",
        buffers,
      );

      studyData.image = images[0];
    }

    if (isVoting) {
      const vote = await voteService.getVote(this.getToday());
      vote.participations = vote.participations.map((participation) => ({
        ...participation,
        attendences: participation.attendences?.filter((attandence) => {
          return (
            (attandence.user as IUser)?.uid.toString() !==
            this.token.uid?.toString()
          );
        }),
      }));
      await vote.save();
    }

    if (todayData?.userList) {
      todayData.userList.forEach((user, index) => {
        if ((user.user as unknown as String) == this.token.id) {
          if (user.place._id !== studyData.place?._id) {
            todayData.userList?.splice(index, 1);
          }
        }
      });
    }

    await todayData.userList?.push(validatedStudy);
    await todayData.save();
    const collection = new CollectionService();
    const result = collection.setCollectionStamp(this.token.id);
    return result;

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

  async patchVote(start: any, end: any) {
    const todayData = await this.getTodayData();
    try {
      if (start && end && todayData?.userList) {
        todayData.userList.forEach((userInfo) => {
          if (userInfo.user.toString() === this.token.id) {
            userInfo.time.start = start;
            userInfo.time.end = end;
          }
        });

        await todayData.save();
      } else {
        return new Error();
      }
    } catch (err) {
      throw new Error();
    }
  }

  async deleteVote() {
    const todayData = await this.getTodayData();
    try {
      todayData.userList = todayData.userList?.filter(
        (userInfo) => userInfo.user.toString() !== this.token.id,
      );

      await todayData.save();
    } catch (err) {
      throw new Error();
    }
  }
  async patchStatus(status: any) {
    const todayData = await this.getTodayData();

    try {
      todayData.userList?.forEach((userInfo) => {
        if (userInfo.user.toString() === this.token.id) {
          userInfo.status = status;
        }
      });

      await todayData.save();
    } catch (err) {
      throw new Error();
    }
  }
  async patchComment(comment: string) {
    const todayData = await this.getTodayData();

    try {
      todayData.userList?.forEach((userInfo) => {
        if (userInfo.user.toString() === this.token.id) {
          userInfo.comment = userInfo.comment || { text: "" };
          userInfo.comment.text = comment;
        }
      });

      await todayData.save();
    } catch (err) {
      throw new Error();
    }
  }

  // 가장 최근의 스터디 가져오기
  async getRecentStudy() {
    return this.getTodayData();
  }
}
