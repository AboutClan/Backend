import { Registered } from "../db/models/registered";

export default class RegisterService {
  constructor() {}

  async register(registerForm: any) {
    Registered.create(registerForm);
  }
}
