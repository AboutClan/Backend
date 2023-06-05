import { Plaza } from "../db/models/plaza";

export default class PlazaService {
  constructor() {}

  async getPlaza() {
    const plazaData = await Plaza.find();
    return plazaData;
  }

  async createPlaza(data: any) {
    await Plaza.create(data);
    return;
  }
}
