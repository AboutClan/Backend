import { JWT } from "next-auth/jwt";

export default class VoteService {
  private token: JWT;
  constructor(token?: JWT) {
    this.token = token as JWT;
  }
}
