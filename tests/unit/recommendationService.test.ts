import { recommendationService } from "../../src/services/recommendationsService.js";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import recommendationBodyFactory from "../factories/recommendationBodyFactory.js";
import { jest } from "@jest/globals";
import { conflictError, notFoundError } from "../../src/utils/errorUtils.js";

describe("Recommendation Service", () => {
  describe("Insert Recommendations", () => {
    it("Should create recommendation", async () => {
      const recommendation = recommendationBodyFactory();
      jest.spyOn(recommendationRepository, "create").mockResolvedValue();

      await recommendationService.insert(recommendation);
      expect(recommendationRepository.create).toBeCalledTimes(1);
    });

    it("Should throw a conflict error if the name of the recommendation is not unique", () => {
      const recommendation = recommendationBodyFactory();
      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValue({ id: 1, ...recommendation, score: 0 });

      return expect(
        recommendationService.insert(recommendation)
      ).rejects.toEqual(conflictError("Recommendations names must be unique"));
    });
  });

  describe("Upvote Recommendation", () => {
    it("Should upvote recommendation", async () => {
      const recommendationTest = {
        id: 1,
        name: "Ultralight Beam",
        youtubeLink: "https://www.youtube.com/watch?v=6oHdAA3AqnE",
        score: 0,
      };

      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValue(recommendationTest);

      const upvoteTest = jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValue({ ...recommendationTest, score: 1 });

      await recommendationService.upvote(1);
      expect(upvoteTest).toBeCalledTimes(1);
    });

    it("Should throw a Not Found Error if no recommendation with that ID is found", () => {
      jest.spyOn(recommendationRepository, "find").mockReturnValue(null);

      return expect(recommendationService.upvote(3)).rejects.toEqual(
        notFoundError()
      );
    });
  });

  describe("Downvote Recommendation", () => {
    it("Should delete the recommendation if score is lower than -5", async () => {
      const recommendationTest = {
        id: 1,
        name: "Ultralight Beam",
        youtubeLink: "https://www.youtube.com/watch?v=6oHdAA3AqnE",
        score: -5,
      };

      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValue(recommendationTest);
      jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValue({ ...recommendationTest, score: -6 });

      const removeTest = jest
        .spyOn(recommendationRepository, "remove")
        .mockResolvedValue(null);

      await recommendationService.downvote(1);
      expect(removeTest).toBeCalledTimes(1);
    });

    it("Should throw a Not Found Error if no recommendation with that ID is found", () => {
      jest.spyOn(recommendationRepository, "find").mockReturnValue(null);

      return expect(recommendationService.downvote(3)).rejects.toEqual(
        notFoundError()
      );
    });
  });

  describe("Get Recommendation", () => {
    it("Should get all recommendations", async () => {
      const getAllTest = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([]);

      await recommendationService.get();
      expect(getAllTest).toBeCalledTimes(1);
    });
  });

  describe("Get Top Recommendations", () => {
    it("Should get a list of all recommendations ordered by score (highest first)", async () => {
      const getTopTest = jest
        .spyOn(recommendationRepository, "getAmountByScore")
        .mockResolvedValue([]);

      await recommendationService.getTop(10);
      expect(getTopTest).toBeCalledTimes(1);
    });
  });

  describe("Get Random Recommendation", () => {
    it("Should get a list of random recommendations", async () => {
      const recommendation = recommendationBodyFactory();
      const getRandomTest = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([{ id: 1, ...recommendation, score: 0 }]);

      await recommendationService.getRandom();
      expect(getRandomTest).toBeCalledTimes(2);
    });

    it("Should throw a Not Found Error if no recommendations with random score filter lower than 0.7", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.5);
      jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

      return expect(recommendationService.getRandom()).rejects.toEqual(
        notFoundError()
      );
    });

    it("Should throw a Not Found Error if no recommendations with random score filter greater than 0.7", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.8);
      jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

      return expect(recommendationService.getRandom()).rejects.toEqual(
        notFoundError()
      );
    });
  });
});
