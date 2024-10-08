import dayjs, { Dayjs } from "dayjs";
import { JWT } from "next-auth/jwt";
import { Collection, CollectionZodSchema } from "../db/models/collection";
import { IPlace, Place } from "../db/models/place";
import { RealtimeModel } from "../db/models/realtime";
import { IUser, User } from "../db/models/user";
import {
  IAbsence,
  IAttendance,
  IParticipation,
  IVote,
  Vote,
} from "../db/models/vote";
import { IVoteStudyInfo } from "../types/vote";
import { convertUserToSummary2 } from "../utils/convertUtils";
import { now, strToDate } from "../utils/dateUtils";
import { findOneVote, findTwoVote } from "../utils/voteUtils";
import { ALPHABET_COLLECTION } from "./collectionService";
export default class VoteService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getArrivedPeriod(startDay: string, endDay: string) {
    try {
      let userArrivedInfo = await Vote.collection
        .aggregate([
          {
            $match: {
              date: {
                $gte: dayjs(startDay).toDate(),
                $lt: dayjs(endDay).toDate(),
              },
            },
          },
          {
            $unwind: "$participations",
          },
          {
            $unwind: "$participations.attendences",
          },
          {
            $lookup: {
              from: "places",
              localField: "participations.place",
              foreignField: "_id",
              as: "place",
            },
          },
          {
            $project: {
              date: "$date",
              attendence: "$participations.attendences",
              place: "$place",
              status: "$participations.status",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "attendence.user",
              foreignField: "_id",
              as: "attendence.user",
            },
          },
          {
            $unwind: "$place",
          },
          {
            $unwind: "$attendence.user",
          },
          {
            $project: {
              date: "$date",
              name: "$attendence.user.name",
              uid: "$attendence.user.uid",
              placeId: "$place._id",
              location: "$place.location",
              arrived: "$attendence.arrived",
              status: "$status",
            },
          },
        ])
        .toArray();

      //open 기록만 가져오는게 아닌 open 및 free 가져오는 걸로 변경
      userArrivedInfo = userArrivedInfo.filter(
        (info) => ["open", "free"].includes(info.status) && info.arrived,
      );

      const results = userArrivedInfo.reduce((acc, obj) => {
        const date = dayjs(obj.date).format("YYYY-MM-DD").toString();
        const placeId = obj.placeId;
        const uid = obj.uid;
        const name = obj.name;

        const idx = acc.findIndex((el: any) => el.date === date);
        if (idx === -1) {
          acc.push({ date, arrivedInfoList: [{ placeId, uid, name }] });
        } else {
          acc[idx].arrivedInfoList.push({ placeId, uid, name });
        }

        return acc;
      }, []);

      results.forEach((result: any) => {
        result.arrivedInfoList = result.arrivedInfoList.reduce(
          (acc: any, obj: any) => {
            const placeId = obj.placeId.toString();
            const uid = obj.uid;
            const name = obj.name;
            const idx = acc.findIndex((el: any) => el.placeId === placeId);

            if (idx === -1) {
              acc.push({ placeId, arrivedInfo: [{ uid, name }] });
            } else {
              acc[idx].arrivedInfo.push({ uid, name });
            }

            return acc;
          },
          [],
        );
      });

      return results;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createVote(date: any) {
    let vote = await Vote.findOne({ date });
    if (!vote) {
      const places = await Place.find({ status: "active" });
      const participants = places.map((place) => {
        const isPrivate = place.brand === "자유 신청";
        return {
          place: place._id,
          attendences: [],
          absences: [],
          invitations: [],
          status: !isPrivate ? "pending" : "free",
        } as any;
      });

      await Vote.create({
        date,
        participations: participants,
      });
    }
  }

  async getVote(date: any): Promise<IVote> {
    try {
      this.createVote(date);
      let vote = await findOneVote(date);

      return vote as IVote;
    } catch (err) {
      throw new Error();
    }
  }

  async getTwoVote(date: any) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    this.createVote(date);
    this.createVote(nextDay);
    let vote = await findTwoVote(date);
    return vote as IVote[];
  }

  async isVoting(date: any) {
    try {
      let vote = await this.getVote(date);

      const isVoting = vote.participations
        .flatMap((participation) =>
          participation.attendences?.map((attendance) => {
            return (attendance.user as IUser)?._id;
          }),
        )
        .find((ObjId) => String(ObjId) === this.token.id);

      return isVoting;
    } catch (err) {
      throw new Error();
    }
  }

  async getFilteredVote(
    date: any,
    location: string,
    isBasic: boolean,
    isTwoDay: boolean,
  ) {
    try {
      const STUDY_RESULT_HOUR = 23;
      const votes: IVote[] = await this.getTwoVote(date);
      const filteredVoteOne = votes[0];
      const filteredVoteTwo = votes[1];

      const user = await User.findOne({ uid: this.token.uid });

      const studyPreference = user?.studyPreference;

      const filterStudy = (filteredVote: IVote) => {
        const voteDate = filteredVote?.date;

        // 위치에 맞는 참여자 필터링 (location이나 '전체'에 해당하는 것만)
        filteredVote.participations = filteredVote?.participations.filter(
          (participation) => {
            if (location === "전체") return true;
            const placeLocation = participation.place?.location;
            return placeLocation === location || placeLocation === "전체";
          },
        );

        // 유저 정보 없는 참석자 제거
        filteredVote.participations = filteredVote?.participations
          .map((par) => ({
            ...par,
            attendences: par?.attendences?.filter((who) => who?.user),
          }))
          .filter((par) => par.place?.brand !== "자유 신청");

        // isConfirmed 여부 확인
        const currentDate = dayjs().add(9, "hour").startOf("day");
        const currentHours = dayjs().add(9, "hour").hour();
        const selectedDate = dayjs(voteDate).add(9, "hour").startOf("day");

        const isConfirmed =
          selectedDate.isBefore(currentDate) || // 선택한 날짜가 현재 날짜 이전인지
          (selectedDate.isSame(currentDate) &&
            currentHours >= STUDY_RESULT_HOUR); // 같은 날이고 특정 시간(STUDY_RESULT_HOUR)이 지났는지

        // 정렬에 사용할 함수들
        const getCount = (participation: IParticipation) => {
          if (!isConfirmed) return participation?.attendences?.length;
          return participation?.attendences?.filter((who) => who.firstChoice)
            .length;
        };

        const getStatusPriority = (status?: string) => {
          switch (status) {
            case "open":
              return 1;
            case "free":
              return 2;
            default:
              return 3;
          }
        };

        const getPlacePriority = (placeId?: string) => {
          if (!studyPreference?.place) return 3; // 선호 장소 없으면 기본 우선순위

          if (placeId === studyPreference.place.toString()) return 1; // 메인 장소 우선순위

          if (
            (studyPreference.subPlace as string[])
              .map((sub) => sub.toString())
              .includes(placeId as string)
          ) {
            return 2; // 서브 장소 우선순위
          }

          return 3; // 그 외 우선순위
        };

        // 정렬 수행
        filteredVote.participations = filteredVote.participations
          .map((par) => {
            const count = getCount(par); // getCount 호출을 한 번으로 줄임

            const statusPriority = getStatusPriority(par.status);

            const placePriority = getPlacePriority(par.place?._id.toString());

            return {
              ...par,
              count,
              statusPriority,
              placePriority,
            };
          })
          .sort((a, b) => {
            // 상태 우선순위 비교
            if (a.statusPriority !== b.statusPriority) {
              return a.statusPriority - b.statusPriority;
            }
            // 참석자 수 비교
            if (a.count !== b.count) {
              return (b?.count as number) - (a?.count as number);
            }
            // 장소 우선순위 비교
            return a.placePriority - b.placePriority;
          })
          .map(({ statusPriority, placePriority, count, ...rest }) => rest);

        filteredVote.participations = filteredVote.participations.filter(
          (par) => par?.place?.brand !== "자유 신청",
        );

        // 기본 모드일 경우 상위 3개만 반환
        if (isBasic) {
          filteredVote.participations = filteredVote.participations.slice(0, 3);
        }
        return {
          date: filteredVote.date,
          participations: filteredVote.participations.map((par) => ({
            place: par.place,
            absences: par.absences,
            status: par.status,
            attendences:
              par.attendences?.map((who) => ({
                time: who.time,
                firstChoice: who.firstChoice,
                memo: who?.memo,
                arrived: who?.arrived,
                imageUrl: who?.imageUrl,
                user: convertUserToSummary2(who.user as IUser),
              })) || [], // attendences가 없을 경우 빈 배열로 처리
          })),
        };
      };
      const data = await RealtimeModel.findOne({ date })
        .populate(["userList.user"])
        .lean();

      if (!data) {
        await RealtimeModel.create({ date });
      }
      const realTime = data
        ? !isBasic && !isTwoDay
          ? data?.userList?.map((props) => ({
              ...props,
              user: convertUserToSummary2(props.user as IUser),
            }))
          : data?.userList
              ?.filter(
                (user) =>
                  (user?.user as IUser)._id === this.token.id.toString(),
              )
              ?.map((props) => ({
                ...props,
                user: convertUserToSummary2(props.user as IUser),
              }))
        : [];

      const result = [{ ...filterStudy(filteredVoteOne), realTime }];

      if (isTwoDay) {
        result.push({
          ...filterStudy(filteredVoteTwo as IVote),
          realTime: undefined,
        });
      }

      return result;
    } catch (err) {
      // 에러 메시지를 구체적으로 기록
      throw new Error(`Error fetching filtered vote data`);
    }
  }
  async getFilteredVoteOne(date: any, id: string) {
    try {
      const filteredVoteOne = await this.getVote(date);

      const result = filteredVoteOne?.participations.find(
        (par) => par.place?._id.toString() === id,
      );

      return result;
    } catch (err) {
      // 에러 메시지를 구체적으로 기록
      throw new Error(`Error fetching filtered vote data`);
    }
  }

  async getWeekDates(date: any) {
    const startOfWeek = dayjs(date).startOf("isoWeek"); // ISO 8601 기준 주의 시작 (월요일)
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      weekDates.push(startOfWeek.add(i, "day").toDate());
    }

    return weekDates;
  }

  async getRangeDates(startDay: any, endDay: any) {
    startDay = dayjs(startDay);
    endDay = dayjs(endDay);

    const dates = [];

    let currentDate: Dayjs = startDay;

    while (currentDate.isBefore(endDay) || currentDate.isSame(endDay)) {
      dates.push(currentDate.toDate());
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  }

  async getParticipantsCnt(location: string, startDay: any, endDay: any) {
    try {
      const dateList = await this.getRangeDates(startDay, endDay);
      const cntList = new Map<Date, number>();
      const totalCntList = new Map<Date, number>(); // totalCntList 추가

      dateList.forEach((date) => {
        cntList.set(date, 0);
        totalCntList.set(date, 0); // 초기화
      });

      await Promise.all(
        dateList.map(async (date, i) => {
          let vote = await findOneVote(date);
          if (!vote) return cntList;

          const map = new Map();
          const totalMap = new Map();
          let cnt = 0;
          let totalCnt = 0;

          vote.participations.forEach((participation) => {
            participation.attendences?.forEach((attendence) => {
              if (attendence.user != null && attendence.firstChoice) {
                if (!map.has((attendence.user as IUser).uid)) {
                  if (
                    participation.place?.location === location &&
                    participation.place?.brand !== "자유 신청"
                  ) {
                    map.set((attendence.user as IUser).uid, 1);
                    cnt++;
                  }
                }
                if (!totalMap.has((attendence.user as IUser).uid)) {
                  totalMap.set((attendence.user as IUser).uid, 1);
                  totalCnt++;
                }
              }
            });
          });

          cntList.set(date, cnt);
          totalCntList.set(date, totalCnt);
        }),
      );
      let array = Array.from(dateList, (date) => ({
        date,
        value: cntList.get(date),
        totalValue: totalCntList.get(date),
      }));
      return array;
    } catch (err) {
      throw new Error();
    }
  }

  async getFilteredVoteByDate(date: any, location: string) {
    try {
      const dateList = await this.getWeekDates(date);

      const result: any[] = [];

      await Promise.all(
        dateList.map(async (date2) => {
          const filteredVote = await this.getVote(date2);

          filteredVote.participations = filteredVote?.participations.filter(
            (participation) => {
              const placeLocation = participation.place?.location;
              return placeLocation === location || placeLocation === "전체";
            },
          );
          //유저 정보 없는 경우 제거
          filteredVote?.participations?.forEach((par) => {
            par.attendences = par?.attendences?.filter((who) => who?.user);
          });

          result.push(filteredVote);
        }),
      );
      return result;
    } catch (err) {
      throw new Error();
    }
  }

  async setVote(date: any, studyInfo: IVoteStudyInfo) {
    try {
      const { place, subPlace, start, end, memo }: IVoteStudyInfo = studyInfo;
      const isVoting = await this.isVoting(date);
      const vote = await this.getVote(date);

      if (isVoting) {
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

      const attendance = {
        time: { start: start, end: end },
        user: this.token.id,
      } as IAttendance;

      //memo는 개인 스터디 신청에 사용 (사전에 작성)

      vote.participations = vote.participations.map(
        (participation: IParticipation) => {
          const placeId = (participation.place as IPlace)._id.toString();
          const subPlaceIdArr = subPlace;

          if (placeId === place) {
            if (participation.status === "dismissed") {
              participation.status = "free";
            }
            return {
              ...participation,
              attendences: [
                ...(participation.attendences || []),
                { ...attendance, firstChoice: true, memo },
              ],
            };
          } else if (subPlaceIdArr?.includes(placeId)) {
            return {
              ...participation,
              attendences: [
                ...(participation.attendences || []),
                { ...attendance, firstChoice: false, memo },
              ],
            };
          }

          return participation;
        },
      );
      await vote.save();
    } catch (err) {
      throw new Error();
    }
  }

  async patchVote(date: any, start: any, end: any) {
    const vote = await this.getVote(date);
    if (!vote) throw new Error();

    try {
      if (start && end) {
        vote.participations.map((participation) => {
          participation.attendences?.map((attendance) => {
            if (
              (attendance.user as IUser)?.uid.toString() ===
              this.token.uid?.toString()
            ) {
              attendance.time.start = start;
              attendance.time.end = end;
            }
          });
        });

        await vote.save();
      } else {
        return new Error();
      }
    } catch (err) {
      throw new Error();
    }
  }

  async deleteVote(date: any) {
    try {
      const vote = await this.getVote(date);
      if (!vote) throw new Error();

      const isVoting = vote.participations
        .flatMap((participation) =>
          participation.attendences?.map((attendence) => {
            return (attendence.user as IUser)?._id;
          }),
        )
        .find((ObjId) => String(ObjId) === this.token.id);

      if (!isVoting) {
        throw new Error();
      }

      vote.participations = vote.participations.map((participation) => ({
        ...participation,
        attendences: participation.attendences?.filter((attendance) => {
          return (
            (attendance.user as IUser)?.uid.toString() !==
            this.token.uid?.toString()
          );
        }),
      }));

      await vote.save();
    } catch (err) {
      throw new Error();
    }
  }

  async getAbsence(date: any) {
    try {
      const result: any[] = [];

      const vote = await this.getVote(date);
      if (!vote) throw new Error();

      vote?.participations.map((participation) => {
        participation.absences?.map((absence) => {
          result.push({
            uid: (absence.user as IUser)?.uid,
            message: absence.message,
          });
        });
      });

      return result;
    } catch (err) {
      throw new Error();
    }
  }

  async setAbsence(date: any, message: string) {
    try {
      const vote = await this.getVote(date);

      await vote?.participations.map((participation) => {
        participation.attendences?.map((attendence) => {
          if (
            (attendence.user as IUser)?.uid.toString() ===
              this.token.uid?.toString() &&
            attendence.firstChoice
          ) {
            if (
              !participation.absences?.some(
                (absence) =>
                  (absence.user as IUser)?.uid.toString() ===
                  this.token.uid?.toString(),
              )
            )
              participation.absences = [
                ...(participation.absences || []),
                {
                  user: this.token.id as string,
                  noShow: true,
                  message,
                },
              ];
          }
        });
      });

      await vote?.save();

      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getArrived(date: any) {
    const vote = await this.getVote(date);
    if (!vote) throw new Error();

    try {
      const arriveInfo: any = [];

      vote.participations.forEach((participation: any) => {
        const arriveForm: any = {};
        arriveForm[participation.place.fullname] = [];
        if (["open", "free"].includes(participation.status as string)) {
          participation.attendences?.forEach((att: any) => {
            if (att.arrived) {
              arriveForm[participation.place.fullname].push({
                location: participation.place.fullname,
                spaceId: participation.place._id,
                uid: (att.user as IUser)?.uid,
                arrived: att.arrived,
              });
            }
          });
        }
        arriveInfo.push(arriveForm);
      });

      return arriveInfo;
    } catch (err) {
      throw new Error();
    }
  }

  async deleteField() {
    return null;
  }

  async patchArrive(date: any, memo: any, endHour: any) {
    const vote = await this.getVote(date);
    if (!vote) throw new Error();

    try {
      const currentTime = now().add(9, "hour");

      vote.participations.forEach((participation: any) => {
        participation.attendences.forEach((att: any) => {
          if (
            (att.user as IUser)._id?.toString() === this.token.id?.toString() &&
            att?.firstChoice
          ) {
            att.time.end = endHour;
            att.arrived = currentTime.toDate();
            //memo가 빈문자열인 경우는 출석이 아닌 개인 스터디 신청에서 사용한 경우
            if (memo) att.memo = memo;
          }
        });
      });

      await vote.save();

      const validatedCollection = CollectionZodSchema.parse({
        user: this.token.id,
        type: "alphabet",
        collects: [],
        collectCnt: 0,
        stamps: 0,
      });

      const currentCollection = await Collection.findOne({
        user: this.token.id,
      });
      const currentStamps = currentCollection?.stamps ?? 0;

      let updatedStamps = currentStamps;
      let updatedAlphabet = null;

      if (currentStamps < 5) {
        if (!currentCollection) {
          // 문서가 없으면 새로 생성
          await Collection.create(validatedCollection);
        } else {
          // 문서가 있으면 stamps 증가
          const updatedDoc = await Collection.findOneAndUpdate(
            { user: this.token.id },
            { $inc: { stamps: 1 } },
            { new: true },
          );
        }

        updatedStamps++;
      }

      const getRandomAlphabet = (percent: number) => {
        const randomValue = Math.random();

        if (randomValue <= percent / 100) {
          const randomIdx = Math.floor(Math.random() * 5);
          const alphabet = ALPHABET_COLLECTION[randomIdx];
          return alphabet;
        }
        return null;
      };
      // stamps가 5인 경우에만 alphabet을 추가합니다
      if (currentCollection?.stamps === 4) {
        const alphabet = getRandomAlphabet(20);
        // stamps가 4인 경우 1 증가 후 5가 되므로 alphabet을 추가
        await Collection.findOneAndUpdate(
          { user: this.token.id },
          {
            $push: { collects: alphabet }, // alphabet을 collects 배열에 추가
            $inc: { collectCnt: 1 }, // collectCnt 값을 1 증가
            $set: { stamps: 0 },
          },
          { new: true },
        );
        updatedAlphabet = alphabet;
        updatedStamps = 0;
      }

      return {
        alphabet: updatedAlphabet, // alphabet을 얻었으면 반환하고, 그렇지 않으면 null
        stamps: updatedStamps, // 현재 stamps에서 1 증가한 값 반환
      };
    } catch (err) {
      throw new Error();
    }
  }

  async patchConfirm(date: any) {
    try {
      const vote = await findOneVote(date);
      if (!vote) throw new Error();

      vote.participations.forEach((participation) => {
        participation.attendences?.forEach((attendance) => {
          if (
            (attendance.user as IUser).uid.toString() ===
            this.token.uid?.toString()
          ) {
            attendance.confirmed = true;
          }
        });
      });
    } catch (err) {
      throw new Error();
    }
  }

  async patchDismiss(date: any) {
    const vote = await findOneVote(date);
    if (!vote) throw new Error();

    try {
      vote.participations.forEach((participation) => {
        const isTargetParticipation = !!participation.attendences?.find(
          (att) =>
            (att.user as IUser)?.uid.toString() === this.token.uid?.toString(),
        );
        if (isTargetParticipation) {
          participation.attendences = participation.attendences?.filter(
            (att) =>
              (att.user as IUser)?.uid.toString() !==
              this.token.uid?.toString(),
          );
          participation.absences = [
            ...(participation.absences as IAbsence[]),
            { user: this.token._id, noShow: false, message: "" } as IAbsence,
          ];
        }
      });

      await vote.save();
    } catch (err) {
      throw new Error();
    }
  }

  async getStart(date: any) {
    try {
      const vote = await findOneVote(date);
      if (!vote) return [];

      const result: any = [];
      vote.participations.map((participation) => {
        if (
          ["open", "free"].includes(participation.status as string) &&
          participation.startTime
        ) {
          const openInfo = {
            place_id: participation.place?._id,
            startTime: participation.startTime,
          };
          result.push(openInfo);
        }
      });

      return result;
    } catch (err) {
      throw new Error();
    }
  }

  async quickVote(
    date: any,
    studyInfo: Omit<IVoteStudyInfo, "place" | "subPlace">,
  ) {
    try {
      const { start, end } = studyInfo;
      const user: any = await User.findOne(
        { uid: this.token.uid },
        "studyPreference",
      );
      let { place, subPlace } = user.studyPreference;

      if (!place) {
        return false;
      }

      place = { _id: place.toString() };
      subPlace = subPlace.map((_id: any) => {
        return { _id: _id.toString() };
      });

      await this.setVote(date, { start, end, place, subPlace });

      return true;
    } catch (err) {
      throw new Error();
    }
  }

  async setFree(date: any, placeId: any) {
    try {
      const vote = await findOneVote(date);

      if (!vote) return;

      vote.participations.forEach(async (participation) => {
        if (participation.place?._id.toString() === placeId) {
          participation.status = "free";
          participation.attendences;
          await vote.save();
        }
      });

      return;
    } catch (err) {
      throw new Error();
    }
  }

  async getArriveCheckCnt() {
    try {
      const arriveCheckCnt = await Vote.collection
        .aggregate([
          {
            $match: {
              date: {
                $gte: strToDate("2023-12-03").toDate(),
                $lte: strToDate("2023-12-04").toDate(),
              },
            },
          },
          {
            $unwind: "$participations",
          },
          {
            $unwind: "$participations.attendences",
          },
          {
            $project: {
              attendence: "$participations.attendences",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "attendence.user",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $project: {
              arrived: "$attendence.arrived",
              uid: "$user.uid",
            },
          },
        ])
        .toArray();

      const result = new Map();
      arriveCheckCnt.forEach((info: any) => {
        if (info.uid[0] && info.hasOwnProperty("arrived")) {
          if (result.has(info.uid[0])) {
            const current = result.get(info.uid[0]);
            result.set(info.uid[0], current + 1);
          } else {
            result.set(info.uid[0], 1);
          }
        }
      });
      return Object.fromEntries(result);
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
