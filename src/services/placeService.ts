import { Place } from "../db/models/place";

export default class PlaceService {
  constructor() {}

  async getActivePlace() {
    const places = await Place.find({ status: "active" });
    return places;
  }
}
