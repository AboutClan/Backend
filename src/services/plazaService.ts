import { Plaza } from "../db/models/plaza";

export default class PlazaService {
  constructor() {}

  async getPlaza() {
    try {
      const plazaData = await Plaza.find();
      return plazaData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createPlaza(data: any) {
    try {
      await Plaza.create(data);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
