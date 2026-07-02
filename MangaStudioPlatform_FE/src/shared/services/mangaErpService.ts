import type {
  ActivatePagePayload,
  ActivateAccountPayload,
  ActivateAccountResult,
  AdminUserDto,
  CastSubmissionVotePayload,
  CastSubmissionVoteResult,
  CreateChapterPayload,
  CreateSubmissionPayload,
  CurrentUser,
  AddQaPinPayload,
  FeedbackPinDto,
  InviteAssistantPayload,
  ListUsersResult,
  PageTaskDto,
  ReviewPageTaskPayload,
  ProvisionAccountPayload,
  ProvisionAccountResult,
  QaBugPinDto,
  QaSessionDto,
  RequestRevisionPayload,
  ResolveSubmissionConflictPayload,
  ResolveSubmissionConflictResult,
  ReviewSubmissionPayload,
  SamEmbeddingResponse,
  SamMaskResponse,
  SamPredictMaskPayload,
  SchedulePublicationPayload,
  SetPageRegionPayload,
  SubmitPageLayerPayload,
  SubmissionDetailDto,
  SubmissionSummaryDto,
  StudioInvitationDto,
  UpdateProfilePayload,
  UpdateAdminAccountPayload,
  UpdateSubmissionManuscriptPayload,
  UpdateSubmissionMetadataPayload,
} from "../types/mangaErp";
import { request } from "./httpClient";
import { API_BASE_URL, SERVICE_BASE_URLS } from "./mangaErpConfig";
import {
  mapChapter,
  mapPageTask,
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

  async updateUser(id: string, payload: UpdateAdminAccountPayload) {
    return request("identity", `/api/v1/admin/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async updateUserRole(id: string, role: number) {
    return request("identity", `/api/v1/admin/accounts/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async updateUserStatus(id: string, status: number) {
    return request("identity", `/api/v1/admin/accounts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async resendActivation(id: string) {
    return request<{ message: string }>("identity", `/api/v1/admin/accounts/${id}/resend-activation`, {
      method: "POST",
    });
  },

  async deleteUser(id: string) {
    return request<{ message: string }>("identity", `/api/v1/admin/accounts/${id}`, {
      method: "DELETE",
    });
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

  async approveSubmission(id: string) {
    return request<void>("submission", `/api/v1/submissions/${id}/approve`, {
      method: "POST",
    });
  },

  async castSubmissionVote(id: string, payload: CastSubmissionVotePayload) {
    return request<CastSubmissionVoteResult>("submission", `/api/v1/submissions/${id}/vote`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async resolveSubmissionConflict(id: string, payload: ResolveSubmissionConflictPayload) {
    return request<ResolveSubmissionConflictResult>(
      "submission",
      `/api/v1/submissions/${id}/resolve-conflict`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async rejectSubmission(id: string, payload: ReviewSubmissionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async requestSubmissionRevision(id: string, payload: RequestRevisionPayload) {
    return request<void>("submission", `/api/v1/submissions/${id}/request-revision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSubmissionFeedbackPins(id: string, includeHistory = false) {
    const suffix = includeHistory ? "/history" : "";
    return request<FeedbackPinDto[]>("submission", `/api/v1/submissions/${id}/feedback-pins${suffix}`);
  },

  async inviteAssistant(seriesId: string, payload: InviteAssistantPayload) {
    return request("series", `/api/v1/studios/${seriesId}/invitations`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSeriesInvitations(seriesId: string) {
    return request<StudioInvitationDto[]>("series", `/api/v1/studios/${seriesId}/invitations`);
  },

  async getPendingInvitations() {
    return request<StudioInvitationDto[]>("series", "/api/v1/studios/invitations/pending");
  },

  async respondToInvitation(invitationId: string, response: "accept" | "decline") {
    return request<void>("series", `/api/v1/studios/invitations/${invitationId}/${response}`, {
      method: "POST",
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
    return data.map((chapter) => mapChapter(chapter, seriesId));
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

  async addBasePage(chapterId: string, pageNumber: number) {
    return request("chapter", `/api/v1/chapters/${chapterId}/pages`, {
      method: "POST",
      body: JSON.stringify({ PageNumber: pageNumber }),
    });
  },

  async setPageRegion(chapterId: string, payload: SetPageRegionPayload) {
    return request("chapter", `/api/v1/chapters/${chapterId}/pages/region`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAssignedPageTasks(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] }>(
      "task",
      `/api/v1/tasks/assigned${query}`,
    );
    const items = Array.isArray(data) ? data : data.items ?? data.Items ?? [];
    return items.map(mapPageTask);
  },

  async getChapterPageTasks(chapterId: string) {
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] }>(
      "task",
      `/api/v1/tasks/chapter/${chapterId}`,
    );
    const items = Array.isArray(data) ? data : data.items ?? data.Items ?? [];
    return items.map(mapPageTask);
  },

  async submitPageTaskLayer(pageTaskId: string, payload: SubmitPageLayerPayload) {
    return request("task", `/api/v1/tasks/${pageTaskId}/layers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async reviewPageTask(pageTaskId: string, payload: ReviewPageTaskPayload) {
    return request("task", `/api/v1/tasks/${pageTaskId}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSamEmbedding(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return request<SamEmbeddingResponse>("segmentation", "/api/segmentation/embedding", {
      method: "POST",
      body: formData,
    });
  },

  async predictSamMask(payload: SamPredictMaskPayload) {
    return request<SamMaskResponse>("segmentation", "/api/segmentation/predict", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async submitChapterForQA(chapterId: string) {
    return request<void>("chapter", `/api/v1/chapters/${chapterId}/submit-for-qa`, { method: "POST" });
  },

  async addQaPin(chapterId: string, payload: AddQaPinPayload) {
    return request<string>("qa", `/api/v1/qa/chapters/${chapterId}/pins`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getQaPins(chapterId: string) {
    // TODO(backend-confirmation): This read endpoint is required by the MF3 UI but is not listed in the official Workflow 3 contract.
    return request<QaBugPinDto[]>("qa", `/api/v1/qa/chapters/${chapterId}/pins`);
  },

  async getQaSession(chapterId: string) {
    // TODO(backend-confirmation): Confirm this session read endpoint before treating it as an official Workflow 3 contract.
    return request<QaSessionDto>("qa", `/api/v1/qa/chapters/${chapterId}/session`);
  },

  async sendQaFeedback(chapterId: string, batchToken: string) {
    return request("qa", `/api/v1/qa/chapters/${chapterId}/send-feedback`, {
      method: "POST",
      body: JSON.stringify({ batchToken }),
    });
  },

  async resolveQaPin(pinId: string) {
    return request<boolean>("qa", `/api/v1/qa/pins/${pinId}/resolve`, { method: "POST" });
  },

  async approveChapterQa(chapterId: string) {
    return request("qa", `/api/v1/qa/chapters/${chapterId}/approve`, { method: "POST" });
  },

  async schedulePublication(payload: SchedulePublicationPayload) {
    // TODO(backend-confirmation): Confirm the exact schedule payload fields; the official contract names the endpoint but does not define its body.
    return request<void>("publishing", "/api/v1/publishing/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async publishChapter(chapterId: string) {
    return request("publishing", "/api/v1/publishing/publish", {
      method: "POST",
      body: JSON.stringify({ chapterId }),
    });
  },
};
