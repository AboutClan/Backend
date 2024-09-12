import { JWT } from "next-auth/jwt";
import { IPlace, Place, PlaceZodSchema } from "../db/models/place";
import { ValidationError } from "../errors/ValidationError";
import { DatabaseError } from "../errors/DatabaseError";

export default class PlaceService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }
  async getActivePlace(status: "active" | "inactive") {
    try {
      const places = await Place.find({ status });
      return places;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async addPlace(placeData: IPlace) {
    try {
      const {
        status,
        fullname,
        brand,
        branch,
        image,
        latitude,
        longitude,
        location,
        coverImage,
        locationDetail,
        time,
        registerDate,
        registrant,
        mapURL,
      } = placeData;

      if (!time) placeData.time = "unknown";
      if (!registerDate) placeData.registerDate = new Date().toString();
      placeData.status = "inactive";
      placeData.registrant = this.token.id as string;

      if (
        !fullname ||
        !brand ||
        !branch ||
        !image ||
        !latitude ||
        !longitude ||
        !location ||
        !coverImage ||
        !locationDetail ||
        !mapURL
      )
        throw new ValidationError(
          `fullname ||brand ||branch ||image ||latitude ||longitude ||location ||coverImage ||locationDetail ||mapURL not exist`,
        );

      const validatedPlace = PlaceZodSchema.parse(placeData);
      await Place.create(validatedPlace);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateStatus(placeId: any, status: any) {
    const statusList = ["active", "inactive"];

    if (!statusList.includes(status)) throw new ValidationError("wrong status");

    const updated = await Place.updateOne({ _id: placeId }, { status });
    if (!updated.modifiedCount) throw new DatabaseError("update failed");

    return;
  }
}
