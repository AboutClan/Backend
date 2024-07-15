import { Square } from "../db/models/square";

export default class SquareService {
  constructor() {}

  async getSquare() {
    try {
      const squareData = await Square.find();
      return squareData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createSquare(data: any) {
    try {
      await Square.create(data);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }
}
