import type {
  ActivatePagePayload,
  ActivateAccountPayload,
  ActivateAccountResult,
  AdminUserDto,
  CreateChapterPayload,
  CreateSubmissionPayload,
  CurrentUser,
  ImportVotePayload,
  ListUsersResult,
  PageTaskDto,
  ProvisionAccountPayload,
  ProvisionAccountResult,
  RankingBoardItemDto,
  RecommendSubmissionPayload,
  ReviewSubmissionPayload,
  SchedulePublicationPayload,
  SubmissionDetailDto,
  SubmissionSummaryDto,
  UpdateProfilePayload,
  UpdateSubmissionManuscriptPayload,
  UpdateSubmissionMetadataPayload,
} from "../types/mangaErp";
import { request } from "./httpClient";
import { API_BASE_URL, SERVICE_BASE_URLS } from "./mangaErpConfig";
import {
  mapChapter,
  mapSeries,
  mapSubmissionDetail,
  mapSubmissionSummary,
  normalizeRole,
  pick,
} from "./mangaErpMappers";

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

  async listUsers(filters: { roleFilter?: number; statusFilter?: number } = {}) {
    const params = new URLSearchParams();
    if (filters.roleFilter !== undefined) {
      params.set("roleFilter", String(filters.roleFilter));
    }
    if (filters.statusFilter !== undefined) {
      params.set("statusFilter", String(filters.statusFilter));
    }

    const query = params.toString();
    return request<ListUsersResult>(
      "identity",
      `/api/v1/admin/accounts${query ? `?${query}` : ""}`,
    );
  },

  async getUser(id: string) {
    return request<AdminUserDto>("identity", `/api/v1/admin/accounts/${id}`);
  },

  async provisionAccount(payload: ProvisionAccountPayload) {
    return request<ProvisionAccountResult>("identity", "/api/v1/admin/accounts/provision", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async activateAccount(payload: ActivateAccountPayload) {
    return request<ActivateAccountResult>("identity", "/api/v1/auth/activate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateProfile(payload: UpdateProfilePayload) {
    return request<{ message: string }>("identity", "/api/v1/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getMySeries() {
    const data = await request<Record<string, unknown>[]>("series", "/api/v1/series/my");
    return data.map(mapSeries);
  },

  async getSeries(id: string) {
    const data = await request<Record<string, unknown>>("series", `/api/v1/series/${id}`);
    return mapSeries(data);
  },

  async getAllSeries() {
    return this.getMySeries();
  },

  async getSeriesByAuthor(_authorId: string) {
    return this.getMySeries();
  },

  async createDraftSubmission(payload: CreateSubmissionPayload) {
    return request<{ submissionId?: string; SubmissionId?: string }>(
      "submission",
      "/api/v1/submissions/draft",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async createSubmission(payload: CreateSubmissionPayload) {
    return this.createDraftSubmission(payload);
  },

  async updateSubmissionMetadata(id: string, payload: UpdateSubmissionMetadataPayload) {
    return request("submission", `/api/v1/submissions/${id}/metadata`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async updateSubmissionManuscript(id: string, payload: UpdateSubmissionManuscriptPayload) {
    return request("submission", `/api/v1/submissions/${id}/manuscript`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async submitSubmission(id: string) {
    return request("submission", `/api/v1/submissions/${id}/submit`, {
      method: "POST",
    });
  },

  async resubmitSubmission(id: string) {
    return request("submission", `/api/v1/submissions/${id}/resubmit`, {
      method: "POST",
    });
  },

  async getMySubmissions(statusFilter?: string) {
    const query = statusFilter ? `?statusFilter=${encodeURIComponent(statusFilter)}` : "";
    const data = await request<Record<string, unknown>[]>("submission", `/api/v1/submissions/my${query}`);
    return data.map(mapSubmissionSummary);
  },

  async getSubmissionQueue(): Promise<SubmissionSummaryDto[]> {
    const data = await request<Record<string, unknown>[]>("submission", "/api/v1/submissions/queue");
    return data.map(mapSubmissionSummary);
  },

  async getSubmission(id: string): Promise<SubmissionDetailDto> {
    const data = await request<Record<string, unknown>>("submission", `/api/v1/submissions/${id}`);
    return mapSubmissionDetail(data);
  },

  async startSubmissionReview(id: string) {
    return request("submission", `/api/v1/submissions/${id}/start-review`, {
      method: "POST",
    });
  },

  async recommendSubmission(id: string, payload: RecommendSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/recommend`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async approveSubmission(id: string) {
    return request<void>("submission", `/api/v1/submissions/${id}/approve`, {
      method: "POST",
    });
  },

  async teRejectSubmission(id: string, payload: ReviewSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/te-reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async ebRejectSubmission(id: string, payload: ReviewSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/eb-reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async teRequestSubmissionRevision(id: string, payload: ReviewSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/te-request-revision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async ebRequestSubmissionRevision(id: string, payload: ReviewSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/eb-request-revision`, {
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
