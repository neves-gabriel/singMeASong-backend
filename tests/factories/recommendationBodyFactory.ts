import { faker } from "@faker-js/faker";

import { CreateRecommendationData } from "../../src/services/recommendationsService.js";

export default function recommendationBodyFactory(): CreateRecommendationData {
  return {
    name: faker.lorem.paragraph(),
    youtubeLink: "https://www.youtube.com/watch?v=wuO4_P_8p-Q",
  };
}
