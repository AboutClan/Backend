import express, { NextFunction, Request, Response } from "express";
import { decode } from "next-auth/jwt";
import { strToDate } from "../utils/dateUtils";
import { findOneVote } from "../utils/voteUtils";
import { IUser } from "../db/models/user";
import {
  IAbsence,
  IAttendance,
  IParticipation,
  IVote,
  Vote,
} from "../db/models/vote";
import { IPlace, Place } from "../db/models/place";
import { IVoteStudyInfo } from "../types/vote";
import dayjs from "dayjs";

const router = express.Router();

router.use("/", async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  const decodedToken = await decode({
    token,
    secret: "klajsdflksjdflkdvdssdq231e1w",
  });

  if (!decodedToken) {
    return res.status(401).send("Unauthorized");
  } else {
    req.token = decodedToken;
    next();
  }
});

router
  .route("/arrived")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { startDay, endDay } = req.query as {
      startDay: string;
      endDay: string;
    };

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

      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  });

router.use(
  "/:date",
  async (req: Request, res: Response, next: NextFunction) => {
    const { date: dateStr } = req.params;
    const dayjsDate = strToDate(dateStr);
    const date = dayjsDate.toDate();

    req.date = date;
    next();
  }
);

router
  .route("/:date")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    let { location } = req.query;
    if (!location) location = "수원";
    const { date } = req;
    if (!date) return res.status(400).send("no data");

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

    try {
      const filteredVote: any = vote;

      filteredVote.participations = vote?.participations.filter(
        (part) => part.place?.location === location
      );

      return res.status(200).json(filteredVote);
    } catch (err) {
      next(err);
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { place, subPlace, start, end }: IVoteStudyInfo = req.body;

    const { token } = req;
    if (!token) return res.status(401).send("Unauthorized");

    const { date } = req;
    if (!date) return res.status(400).send("no data");

    const vote = await findOneVote(date);
    if (!vote) throw new Error();

    const isVoting = vote.participations
      .flatMap((participation) =>
        participation.attendances?.map((attendence) => {
          return (attendence.user as IUser)?._id;
        })
      )
      .find((ObjId) => String(ObjId) === token.id);

    try {
      if (isVoting) {
        vote.participations = vote.participations.map((participation) => ({
          ...participation,
          attendences: participation.attendances?.filter((attandence) => {
            return (
              (attandence.user as IUser)?.uid.toString() !==
              token.uid?.toString()
            );
          }),
        }));

        await vote.save();
      }

      const attendance = {
        time: { start: start, end: end },
        user: token.id,
      } as IAttendance;

      vote.participations = vote.participations.map(
        (participation: IParticipation) => {
          const placeId = (participation.place as IPlace)._id.toString();
          const subPlaceIdArr = subPlace?.map((place) => place._id);
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
      return res.status(204).end();
    } catch (err) {}
  })
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    const { date } = req;
    if (!token) return res.status(401).send("Unauthorized");
    if (!date) return res.status(400).send("no data");

    const { start, end }: IVoteStudyInfo = req.body;

    try {
      const vote = await findOneVote(date);
      if (!vote) throw new Error();

      if (start && end) {
        vote.participations.map((participation) => {
          participation.attendances?.map((attendance) => {
            if (
              (attendance.user as IUser)?.uid.toString() ===
              token.uid?.toString()
            ) {
              attendance.time.start = start;
              attendance.time.end = end;
            }
          });
        });

        await vote.save();
        return res.status(204).end();
      } else {
        return res.status(500).end();
      }
    } catch (err) {
      next(err);
    }
  })
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req;
    const { date } = req;

    if (!token) return res.status(401).send("Unauthorized");
    if (!date) return res.status(400).send("no data");

    try {
      const vote = await findOneVote(date);
      if (!vote) throw new Error();

      const isVoting = vote.participations
        .flatMap((participation) =>
          participation.attendances?.map((attendence) => {
            return (attendence.user as IUser)?._id;
          })
        )
        .find((ObjId) => String(ObjId) === token.id);

      if (!isVoting) {
        return res.status(204).end();
      }

      vote.participations = vote.participations.map((participation) => ({
        ...participation,
        attendences: participation.attendances?.filter((attendance) => {
          return (
            (attendance.user as IUser)?.uid.toString() !== token.uid?.toString()
          );
        }),
      }));

      await vote.save();
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

//Todo: aggregate와 속도 비교
router
  .route("/:date/absence")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    try {
      const result: any[] = [];

      const vote = await findOneVote(date);
      if (!vote) throw new Error();

      vote?.participations.map((participation) => {
        participation.absences?.map((absence) => {
          result.push({
            uid: (absence.user as IUser)?.uid,
            message: absence.message,
          });
        });
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/arrived")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    try {
      const vote = await findOneVote(date);
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

      return res.status(200).json(arriveInfo);
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/confirm")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { date } = req;
    const { token } = req;
    if (!date) return res.status(400).send("no data");
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const vote = await findOneVote(date);
      if (!vote) throw new Error();

      vote.participations.forEach((participation) => {
        participation.attendances?.forEach((attendance) => {
          if (
            (attendance.user as IUser).uid.toString() === token.uid?.toString()
          ) {
            attendance.confirmed = true;
          }
        });
      });
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/dismiss")
  .patch(async (req: Request, res: Response, next: NextFunction) => {
    const { date } = req;
    const { token } = req;
    if (!date) return res.status(400).send("no data");
    if (!token) return res.status(401).send("Unauthorized");

    try {
      const vote = await findOneVote(date);
      if (!vote) return res.status(500).end();

      vote.participations.forEach((participation) => {
        const isTargetParticipation = !!participation.attendances?.find(
          (att) => (att.user as IUser)?.uid.toString() === token.uid?.toString()
        );
        if (isTargetParticipation) {
          participation.attendances = participation.attendances?.filter(
            (att) =>
              (att.user as IUser)?.uid.toString() !== token.uid?.toString()
          );
          participation.absences = [
            ...(participation.absences as IAbsence[]),
            { user: token._id, noShow: false, message: "" } as IAbsence,
          ];
        }
      });

      await vote.save();
      return res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:date/start")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const { date } = req;
    if (!date) return res.status(400).send("no data");

    try {
      const vote = await findOneVote(date);
      if (!vote) return res.status(500).end();

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
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
