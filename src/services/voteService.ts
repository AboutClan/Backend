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
import { IUser } from "../db/models/user";
import { IVoteStudyInfo } from "../types/vote";

export default class VoteService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }

  async getArrivedPeriod(startDay: string, endDay: string) {
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
  }

  async getVote(date: any): Promise<IVote> {
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
  }

  async isVoting(date: any) {
    let vote = await this.getVote(date);

    const isVoting = vote.participations
      .flatMap((participation) =>
        participation.attendances?.map((attendence) => {
          return (attendence.user as IUser)?._id;
        })
      )
      .find((ObjId) => String(ObjId) === this.token.id);

    return isVoting;
  }

  async getFilteredVote(date: any, location: string) {
    const filteredVote = await this.getVote(date);

    filteredVote.participations = filteredVote?.participations.filter(
      (participation) => participation.place?.location === location
    );

    return filteredVote;
  }

  async setVote(date: any, studyInfo: IVoteStudyInfo) {
    const { place, subPlace, start, end }: IVoteStudyInfo = studyInfo;
    const isVoting = await this.isVoting(date);
    const vote = await this.getVote(date);

    if (isVoting) {
      vote.participations = vote.participations.map((participation) => ({
        ...participation,
        attendences: participation.attendances?.filter((attandence) => {
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
              ...(participation.attendances || []),
              { ...attendance, firstChoice: true },
            ],
          };
        } else if (subPlaceIdArr?.includes(placeId)) {
          return {
            ...participation,
            attendences: [
              ...(participation.attendances || []),
              { ...attendance, firstChoice: false },
            ],
          };
        }
        return participation;
      }
    );

    await vote.save();
  }

  async patchVote(date: any, start: any, end: any) {
    const vote = await this.getVote(date);
    if (!vote) throw new Error();

    if (start && end) {
      vote.participations.map((participation) => {
        participation.attendances?.map((attendance) => {
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
  }

  async deleteVote(date: any) {
    const vote = await this.getVote(date);
    if (!vote) throw new Error();

    const isVoting = vote.participations
      .flatMap((participation) =>
        participation.attendances?.map((attendence) => {
          return (attendence.user as IUser)?._id;
        })
      )
      .find((ObjId) => String(ObjId) === this.token.id);

    if (!isVoting) {
      throw new Error();
    }

    vote.participations = vote.participations.map((participation) => ({
      ...participation,
      attendences: participation.attendances?.filter((attendance) => {
        return (
          (attendance.user as IUser)?.uid.toString() !==
          this.token.uid?.toString()
        );
      }),
    }));

    await vote.save();
  }

  async getAbsence(date: any) {
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
  }

  async getArrived(date: any) {
    const vote = await this.getVote(date);
    if (!vote) throw new Error();

    const arriveInfo: any = [];

    vote.participations.forEach((participation: any) => {
      const arriveForm: any = {};
      arriveForm[participation.place.fullname] = [];
      if (participation.status === "open") {
        participation.attendences.forEach((att: any) => {
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
  }

  async patchConfirm(date: any) {
    const vote = await findOneVote(date);
    if (!vote) throw new Error();

    vote.participations.forEach((participation) => {
      participation.attendances?.forEach((attendance) => {
        if (
          (attendance.user as IUser).uid.toString() ===
          this.token.uid?.toString()
        ) {
          attendance.confirmed = true;
        }
      });
    });
  }

  async patchDismiss(date: any) {
    const vote = await findOneVote(date);
    if (!vote) throw new Error();

    vote.participations.forEach((participation) => {
      const isTargetParticipation = !!participation.attendances?.find(
        (att) =>
          (att.user as IUser)?.uid.toString() === this.token.uid?.toString()
      );
      if (isTargetParticipation) {
        participation.attendances = participation.attendances?.filter(
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
  }

  async getStart(date: any) {
    const vote = await findOneVote(date);
    if (!vote) throw new Error();

    const result: any = [];
    vote.participations.map((participation) => {
      if (participation.status === "open" && participation.startTime) {
        const openInfo = {
          place_id: participation.place?._id,
          startTime: participation.startTime,
        };
        result.push(openInfo);
      }
    });

    return result;
  }
}