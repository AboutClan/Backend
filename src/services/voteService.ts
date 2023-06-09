import dayjs from "dayjs";
import { JWT } from "next-auth/jwt";
import {
  IAbsence,
  IAttendance,
  IParticipation,
  IVote,
  Vote,
} from "../db/models/vote";
import { findOneVote } from "../utils/voteUtils";
import { IPlace, Place } from "../db/models/place";
import { IUser, User } from "../db/models/user";
import { IVoteStudyInfo } from "../types/vote";
import { now } from "../utils/dateUtils";

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

      userArrivedInfo = userArrivedInfo.filter(
        (info) => info.status === "open" && info.arrived
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
          []
        );
      });

      return results;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async getVote(date: any): Promise<IVote> {
    try {
      let vote = await findOneVote(date);

      if (!vote) {
        const places = await Place.find({ status: "active" });
        const participants = places.map((place) => {
          return {
            place: place._id,
            attendences: [],
            absences: [],
            invitations: [],
            status: "pending",
          } as any;
        });

        await Vote.create({
          date,
          participations: participants,
        });

        vote = await findOneVote(date);
      }

      return vote as IVote;
    } catch (err) {
      throw new Error();
    }
  }

  async isVoting(date: any) {
    try {
      let vote = await this.getVote(date);

      const isVoting = vote.participations
        .flatMap((participation) =>
          participation.attendences?.map((attendance) => {
            return (attendance.user as IUser)?._id;
          })
        )
        .find((ObjId) => String(ObjId) === this.token.id);

      return isVoting;
    } catch (err) {
      throw new Error();
    }
  }

  async getFilteredVote(date: any, location: string) {
    try {
      const filteredVote = await this.getVote(date);

      filteredVote.participations = filteredVote?.participations.filter(
        (participation) => participation.place?.location === location
      );

      return filteredVote;
    } catch (err) {
      throw new Error();
    }
  }

  async setVote(date: any, studyInfo: IVoteStudyInfo) {
    try {
      const { place, subPlace, start, end }: IVoteStudyInfo = studyInfo;
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

      vote.participations = vote.participations.map(
        (participation: IParticipation) => {
          const placeId = (participation.place as IPlace)._id.toString();
          const subPlaceIdArr = subPlace?.map((place: any) => place._id);
          if (placeId === place._id) {
            return {
              ...participation,
              attendences: [
                ...(participation.attendences || []),
                { ...attendance, firstChoice: true },
              ],
            };
          } else if (subPlaceIdArr?.includes(placeId)) {
            return {
              ...participation,
              attendences: [
                ...(participation.attendences || []),
                { ...attendance, firstChoice: false },
              ],
            };
          }
          return participation;
        }
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
          })
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
                  this.token.uid?.toString()
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

  async patchArrive(date: any, memo: any) {
    const vote = await this.getVote(date);
    if (!vote) throw new Error();

    try {
      const currentTime = now().add(9, "hour");

      vote.participations.forEach((participation: any) => {
        participation.attendences.forEach((att: any) => {
          if (
            (att.user as IUser)._id.toString() === this.token.id?.toString() &&
            att.firstChoice
          ) {
            const { start, end } = att.time;
            const startable = dayjs(start).add(8, "hour");
            const endable = dayjs(end).add(9, "hour");
            if (startable <= currentTime && currentTime <= endable) {
              att.arrived = currentTime.toDate();
              att.memo = memo;
            } else {
              return false;
            }
          }
        });
      });

      await vote.save();
      return true;
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
            (att.user as IUser)?.uid.toString() === this.token.uid?.toString()
        );
        if (isTargetParticipation) {
          participation.attendences = participation.attendences?.filter(
            (att) =>
              (att.user as IUser)?.uid.toString() !== this.token.uid?.toString()
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
    studyInfo: Omit<IVoteStudyInfo, "place" | "subPlace">
  ) {
    try {
      const { start, end } = studyInfo;
      const user: any = await User.findOne(
        { uid: this.token.uid },
        "studyPreference"
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
            $match: {},
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
