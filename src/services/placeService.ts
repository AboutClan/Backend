import { Place } from "../db/models/place";

export default class PlaceService {
  constructor() {}

  async getActivePlace() {
    try {
      const places = await Place.find({ status: "active" });
      return places;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
