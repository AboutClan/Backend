import { Plaza } from "../db/models/plaza";

export default class PlazaService {
  constructor() {}

  async getPlaza() {
    const plazaData = await Plaza.find();
    console.log(plazaData);
    return plazaData;
  }
}
