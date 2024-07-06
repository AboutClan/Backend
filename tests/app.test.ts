import request from "supertest";
import app from "../src/app";

describe("Test the root path", () => {
  let server: any;

  beforeAll(async () => {
    server = await app.listen(3333);
  });

  afterAll(async () => {
    await server.close();
  });

  test("It should respond to the GET method", async () => {
    const response = await request(server).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("hello world");
  });
});
