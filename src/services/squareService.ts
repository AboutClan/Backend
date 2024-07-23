import { SecretSquare } from "../db/models/secretSquare";

export default class SquareService {
  constructor() {}

  async getSquareList() {
    try {
      const squareData = await SecretSquare.find();
      return squareData;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async createSquare(data: any) {
    try {
      await SecretSquare.create(data);
      return;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  async deleteSquare() {}

  async getSquare() {}

  async getSquareComments() {}

  async createSquareComment() {}

  async deleteSquareComment() {}

  async putPoll() {}

  async canPoll() {}
}
