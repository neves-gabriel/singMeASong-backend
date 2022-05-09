import { prisma } from "../../src/database.js";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

export default async function recommendationFactory(
  recommendation: CreateRecommendationData
) {
  return await prisma.recommendation.create({
    data: recommendation,
  });
}
