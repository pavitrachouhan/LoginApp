const request = require("supertest");
const app = require("../server");

describe("Health API", () => {
  it("should return ok status", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("database");
  });
});
