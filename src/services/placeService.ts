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
    console.log(this.token);
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

      if (!status) placeData.status = "active";
      if (!time) placeData.time = "unknown";
      if (!registerDate) placeData.registerDate = new Date().toString();
      if (!registrant) placeData.registrant = this.token._id as string;

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
}
