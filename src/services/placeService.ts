import { JWT } from "next-auth/jwt";
import { IPlace, Place } from "../db/models/place";

export default class PlaceService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }
  async getActivePlace() {
    try {
      const places = await Place.find({ status: "active" });
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
        throw new Error();

      await Place.create(placeData);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async updateStatus(placeId: any, status: any) {
    try{
      const statusList = ["active", "inactive"];

      if (!statusList.includes(status)) throw new Error();

      await Place.updateOne({_id: placeId}, {status});

      return;
    }
  }
}
