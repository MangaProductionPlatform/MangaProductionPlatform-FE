import type { QaPinDto, QaSessionDto } from "../types/mangaErp";
import { request } from "./httpClient";

export const qaService = {
  async getSessionPins(chapterId: string): Promise<QaPinDto[]> {
    return request<QaPinDto[]>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/pins`,
    );
  },

  async getQaSession(chapterId: string): Promise<QaSessionDto> {
    return request<QaSessionDto>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/session`,
    );
  },
};
