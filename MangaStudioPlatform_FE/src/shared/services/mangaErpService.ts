import type {
  ActivatePagePayload,
  CreateChapterPayload,
  CreateSubmissionPayload,
  CurrentUser,
  ImportVotePayload,
  PageTaskDto,
  RankingBoardItemDto,
  RecommendSubmissionPayload,
  ReviewSubmissionPayload,
  SchedulePublicationPayload,
} from "../types/mangaErp";
import { request } from "./httpClient";
import { API_BASE_URL, SERVICE_BASE_URLS } from "./mangaErpConfig";
import { mapChapter, mapSeries, normalizeRole, pick } from "./mangaErpMappers";

export const mangaErpApi = {
  baseUrl: API_BASE_URL,
  serviceBaseUrls: SERVICE_BASE_URLS,

  async login(email: string, password: string): Promise<CurrentUser> {
    const data = await request<Record<string, unknown>>("identity", "/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return {
      email,
      userId: pick<string>(data, "userId"),
      role: normalizeRole(pick<string>(data, "role")),
      accessToken: pick<string>(data, "accessToken"),
      refreshToken: pick<string>(data, "refreshToken"),
    };
  },

  async getAllSeries() {
    const data = await request<Record<string, unknown>[]>("series", "/api/v1/series");
    return data.map(mapSeries);
  },

  async getSeries(id: string) {
    const data = await request<Record<string, unknown>>("series", `/api/v1/series/${id}`);
    return mapSeries(data);
  },

  async getSeriesByAuthor(authorId: string) {
    const data = await request<Record<string, unknown>[]>("series",
      `/api/v1/series/by-author/${authorId}`,
    );
    return data.map(mapSeries);
  },

  async cancelSeries(id: string) {
    return request<void>("series", `/api/v1/series/${id}/cancel`, { method: "POST" });
  },

  async createSubmission(payload: CreateSubmissionPayload) {
    return request<{ submissionId?: string; SubmissionId?: string }>(
      "submission",
      "/api/v1/submissions",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async recommendSubmission(id: string, payload: RecommendSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/recommend`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async approveSubmission(id: string, reviewerId: string) {
    return request<void>(
      "submission",
      `/api/v1/submissions/${id}/approve?reviewerId=${encodeURIComponent(reviewerId)}`,
      { method: "POST" },
    );
  },

  async rejectSubmission(id: string, payload: ReviewSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async requestSubmissionRevision(id: string, payload: ReviewSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/request-revision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createChapter(payload: CreateChapterPayload) {
    return request("chapter", "/api/v1/chapters", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getChaptersBySeries(seriesId: string) {
    const data = await request<Record<string, unknown>[]>("chapter",
      `/api/v1/chapters/series/${seriesId}`,
    );
    return data.map(mapChapter);
  },

  async getChapter(id: string) {
    const data = await request<Record<string, unknown>>("chapter", `/api/v1/chapters/${id}`);
    return mapChapter(data);
  },

  async activatePage(chapterId: string, payload: ActivatePagePayload) {
    return request<PageTaskDto>("chapter", `/api/v1/chapters/${chapterId}/pages/activate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async submitChapterForQA(chapterId: string, mangakaId: string) {
    return request<void>(
      "chapter",
      `/api/v1/chapters/${chapterId}/submit-for-qa?mangakaId=${encodeURIComponent(mangakaId)}`,
      { method: "POST" },
    );
  },

  async getRankingBoard(votePeriod: string) {
    return request<RankingBoardItemDto[]>("ranking",
      `/api/v1/ranking/board?votePeriod=${encodeURIComponent(votePeriod)}`,
    );
  },

  async importVote(payload: ImportVotePayload) {
    return request<void>("ranking", "/api/v1/ranking/votes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async schedulePublication(payload: SchedulePublicationPayload) {
    return request<void>("publishing", "/api/v1/publishing/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
