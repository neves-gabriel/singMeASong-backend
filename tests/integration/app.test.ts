import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import recommendationBodyFactory from "../factories/recommendationBodyFactory.js";
import recommendationFactory from "../factories/recommendationFactory.js";

export async function truncateRecommendations() {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}

export async function disconnect() {
  await prisma.$disconnect();
}

export async function findRecommendationByName(name: string) {
  return await prisma.recommendation.findUnique({
    where: { name },
  });
}

export async function findRecommendationById(id: number) {
  return await prisma.recommendation.findUnique({
    where: { id },
  });
}

describe("Recommendations", () => {
  beforeEach(truncateRecommendations);

  afterAll(disconnect);

  describe("POST /recommendations", () => {
    it("should add and persist a new song recommendation", async () => {
      const song = recommendationBodyFactory();

      const result = await supertest(app).post("/recommendations").send(song);

      const createdSong = await findRecommendationByName(song.name);

      expect(result.status).toEqual(201);
      expect(createdSong).not.toBe(null);
    });
  });

  describe("GET /recommendations", () => {
    it("should return status 200 and the last 10 recommendations", async () => {
      const result = await supertest(app).get("/recommendations");

      expect(result.status).toEqual(200);
      expect(result.body.length).toBeLessThan(10);
    });
  });

  describe("GET /recommendations/random", () => {
    it("should return status 200 and a random recommendation", async () => {
      const song = recommendationBodyFactory();

      await supertest(app).post("/recommendations").send(song);
      const result = await supertest(app).get("/recommendations/random");

      expect(result.status).toEqual(200);
      expect(result.body).not.toBe(null);
    });
  });

  describe("GET /recommendations/top/:amount", () => {
    it("should return status 200 and the top recommendations", async () => {
      const amount = 7;

      const recommendations = Array.from({ length: amount }, () => {
        return recommendationBodyFactory();
      });
      await prisma.recommendation.createMany({ data: recommendations });

      const result = await supertest(app).get(`/recommendations/top/${amount}`);

      expect(result.status).toEqual(200);
      expect(result.body.length).toEqual(amount);
    });
  });

  describe("GET /recommendations/:id", () => {
    it("should return status 200 and the recommendation found by id", async () => {
      const song = recommendationBodyFactory();
      const createdRecommendation = await recommendationFactory(song);

      const result = await supertest(app).get(
        `/recommendations/${createdRecommendation.id}`
      );

      expect(result.status).toEqual(200);
      expect(result.body.id).toEqual(createdRecommendation.id);
    });
  });

  describe("POST /recommendations/:id/upvote", () => {
    it("should return status 200 and increment the recommendation score with 1", async () => {
      const song = recommendationBodyFactory();
      const createdRecommendation = await recommendationFactory(song);

      const result = await supertest(app).post(
        `/recommendations/${createdRecommendation.id}/upvote`
      );

      const recommendation = await findRecommendationById(
        createdRecommendation.id
      );

      expect(result.status).toEqual(200);
      expect(recommendation.score).toEqual(createdRecommendation.score + 1);
    });
  });

  describe("POST /recommendations/:id/downvote", () => {
    it("should return status 200 and decrement the recommendation score with 1", async () => {
      const song = recommendationBodyFactory();
      const createdRecommendation = await recommendationFactory(song);

      const result = await supertest(app).post(
        `/recommendations/${createdRecommendation.id}/downvote`
      );

      const recommendation = await findRecommendationById(
        createdRecommendation.id
      );

      expect(result.status).toEqual(200);
      expect(recommendation.score).toEqual(createdRecommendation.score - 1);
    });
  });
});
