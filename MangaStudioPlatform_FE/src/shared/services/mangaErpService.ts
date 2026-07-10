import type {
  ActivatePagePayload,
  ActivateAccountPayload,
  ActivateAccountResult,
  AdminUserDto,
  BulkActivatePagesPayload,
  BulkReviewPageTaskPayload,
  CastSubmissionVotePayload,
  CastSubmissionVoteResult,
  CreateChapterPayload,
  CreateSubmissionPayload,
  CurrentUser,
  AddQaPinPayload,
  AssignQaFixPayload,
  FeedbackPinDto,
  InviteAssistantPayload,
  LayerHistoryDto,
  ListUsersResult,
  MediaUploadResult,
  NotificationDto,
  PageTaskDto,
  ReviewPageTaskPayload,
  ProvisionAccountPayload,
  ProvisionAccountResult,
  QaBugPinDto,
  QaFeedbackHistoryDto,
  QaHistoryDto,
  QaQueueChapterDto,
  QaReviewPageDto,
  QaRevisionTaskDto,
  QaSessionDto,
  QaSummaryDto,
  CompleteQaSessionPayload,
  RequestRevisionPayload,
  ReassignPageTaskPayload,
  ResolveQaPinPayload,
  ResolveSubmissionConflictPayload,
  ResolveSubmissionConflictResult,
  ReviewSubmissionPayload,
  SamEmbeddingResponse,
  SamMaskResponse,
  SamPredictMaskPayload,
  SchedulePublicationPayload,
  SetPageRegionPayload,
  SubmitPageLayerPayload,
  StartQaSessionPayload,
  SubmissionDetailDto,
  SubmissionSummaryDto,
  SubmissionVotesDto,
  StudioInvitationDto,
  UpdateProfilePayload,
  UpdateAdminAccountPayload,
  UpdateQaPinPayload,
  UpdateTaskDeadlinePayload,
  UpdateSubmissionManuscriptPayload,
  UpdateSubmissionMetadataPayload,
  UnresolveQaPinPayload,
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

function pickAny<T>(value: Record<string, unknown>, keys: string[]): T {
  for (const key of keys) {
    const candidate = value[key];
    if (candidate !== undefined) return candidate as T;
  }
  return undefined as T;
}

function mapQaPin(item: Record<string, unknown>): QaBugPinDto {
  return {
    id: pickAny<string>(item, ["id", "Id", "pinId", "PinId"]),
    chapterId: pickAny<string | undefined>(item, ["chapterId", "ChapterId"]),
    pageTaskId: pickAny<string | undefined>(item, ["pageTaskId", "PageTaskId"]),
    pageId: pickAny<string | undefined>(item, ["pageId", "PageId"]),
    editorId: pickAny<string | undefined>(item, ["editorId", "EditorId"]),
    coordinateX: pickAny<number>(item, ["coordinateX", "CoordinateX"]),
    coordinateY: pickAny<number>(item, ["coordinateY", "CoordinateY"]),
    noteMessage: pickAny<string | undefined>(item, ["noteMessage", "NoteMessage"]),
    description: pickAny<string | undefined>(item, ["description", "Description"]),
    issueType: pickAny<string | null | undefined>(item, ["issueType", "IssueType"]),
    pinType: pickAny<string | null | undefined>(item, ["pinType", "PinType"]),
    severity: pickAny<string | null | undefined>(item, ["severity", "Severity"]),
    category: pickAny<string | null | undefined>(item, ["category", "Category"]),
    assignedToRole: pickAny<string | null | undefined>(item, ["assignedToRole", "AssignedToRole"]),
    batchToken: pickAny<string | undefined>(item, ["batchToken", "BatchToken"]),
    resolvedImageUrl: pickAny<string | null | undefined>(item, ["resolvedImageUrl", "ResolvedImageUrl"]),
    notes: pickAny<string | null | undefined>(item, ["notes", "Notes"]),
    status: pickAny<string>(item, ["status", "Status"]),
    resolvedAt: pickAny<string | null | undefined>(item, ["resolvedAt", "ResolvedAt"]),
    createdAt: pickAny<string | undefined>(item, ["createdAt", "CreatedAt"]),
  };
}

function mapQaSession(item: Record<string, unknown>): QaSessionDto {
  return {
    id: pickAny<string | undefined>(item, ["id", "Id", "sessionId", "SessionId"]),
    sessionId: pickAny<string | undefined>(item, ["sessionId", "SessionId", "id", "Id"]),
    qaSessionId: pickAny<string | undefined>(item, ["qaSessionId", "QaSessionId", "sessionId", "SessionId"]),
    chapterId: pickAny<string>(item, ["chapterId", "ChapterId"]),
    editorId: pickAny<string | undefined>(item, ["editorId", "EditorId"]),
    status: pickAny<string>(item, ["status", "Status"]),
    isApproved: pickAny<boolean | undefined>(item, ["isApproved", "IsApproved"]),
    approvedAt: pickAny<string | null | undefined>(item, ["approvedAt", "ApprovedAt"]),
    createdAt: pickAny<string | undefined>(item, ["createdAt", "CreatedAt", "startedAt", "StartedAt"]),
    completedAt: pickAny<string | null | undefined>(item, ["completedAt", "CompletedAt"]),
  };
}

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

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return request<MediaUploadResult>("media", "/api/v1/media/upload", {
      method: "POST",
      body: formData,
    });
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

  async getSubmissionVotes(id: string, round?: number) {
    const query = round !== undefined ? `?round=${encodeURIComponent(String(round))}` : "";
    return request<SubmissionVotesDto>("submission", `/api/v1/submissions/${id}/votes${query}`);
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

  async bulkActivatePages(chapterId: string, payload: BulkActivatePagesPayload) {
    return request("chapter", `/api/v1/chapters/${chapterId}/pages/bulk-activate`, {
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

  async reassignPageTask(chapterId: string, pageNumber: number, payload: ReassignPageTaskPayload) {
    return request("chapter", `/api/v1/chapters/${chapterId}/pages/${pageNumber}/reassign`, {
      method: "PUT",
      body: JSON.stringify(payload),
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

  async getPageTask(pageTaskId: string) {
    const data = await request<Record<string, unknown>>("task", `/api/v1/tasks/${pageTaskId}`);
    return mapPageTask(data);
  },

  async getMyNotifications(unreadOnly = false) {
    return request<NotificationDto[]>(
      "publishing",
      `/api/v1/notifications?unreadOnly=${unreadOnly}`,
    );
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

  async bulkReviewPageTasks(payload: BulkReviewPageTaskPayload) {
    return request("task", "/api/v1/tasks/bulk-review", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getLayerHistory(filters: {
    seriesId?: string;
    chapterId?: string;
    pageTaskId?: string;
    status?: "Accepted" | "Rejected" | "Pending" | "Current";
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return request<LayerHistoryDto[]>("task", `/api/v1/tasks/layers/history${query ? `?${query}` : ""}`);
  },

  async updateTaskDeadline(pageTaskId: string, payload: UpdateTaskDeadlinePayload) {
    return request("task", `/api/v1/tasks/${pageTaskId}/deadline`, {
      method: "PATCH",
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

  async resubmitChapterForQA(chapterId: string) {
    return request<void>("qa", `/api/v1/qa/chapters/${chapterId}/resubmit`, { method: "POST" });
  },

  async getQaQueue(status = "Pending") {
    void status;
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] }>(
      "qa",
      "/api/v1/qa/queue",
    );
    const items = Array.isArray(data) ? data : data.items ?? data.Items ?? [];
    return items.map((item) => ({
      chapterId: pickAny<string>(item, ["chapterId", "ChapterId", "id", "Id"]),
      seriesId: pickAny<string | null | undefined>(item, ["seriesId", "SeriesId"]),
      seriesTitle: pickAny<string | null | undefined>(item, ["seriesTitle", "SeriesTitle"]),
      title: pickAny<string>(item, ["title", "Title", "chapterTitle", "ChapterTitle"]),
      chapterNumber: pickAny<number | null | undefined>(item, ["chapterNumber", "ChapterNumber"]),
      status: pickAny<string>(item, ["status", "Status"]),
      totalPages: pickAny<number | null | undefined>(item, ["totalPages", "TotalPages"]),
      deadline: pickAny<string | null | undefined>(item, ["deadline", "Deadline"]),
      submittedAt: pickAny<string | null | undefined>(item, ["submittedAt", "SubmittedAt", "createdAt", "CreatedAt"]),
    })) satisfies QaQueueChapterDto[];
  },

  async startQaSession(chapterId: string, payload: StartQaSessionPayload) {
    void payload;
    const data = await request<Record<string, unknown> | string>("qa", `/api/v1/qa/chapters/${chapterId}/start`, {
      method: "POST",
    });
    if (typeof data === "string") return data;
    return mapQaSession(data);
  },

  async getQaSessionById(chapterId: string) {
    const data = await request<Record<string, unknown>>("qa", `/api/v1/qa/chapters/${chapterId}/session`);
    return mapQaSession(data);
  },

  async getQaSessionPages(chapterId: string) {
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] }>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/pages`,
    );
    const items = Array.isArray(data) ? data : data.items ?? data.Items ?? [];
    return items.map((item) => ({
      pageId: pickAny<string>(item, ["pageTaskId", "PageTaskId", "pageId", "PageId", "id", "Id"]),
      pageTaskId: pickAny<string>(item, ["pageTaskId", "PageTaskId", "pageId", "PageId", "id", "Id"]),
      pageNumber: pickAny<number>(item, ["pageNumber", "PageNumber"]),
      description: pickAny<string | null | undefined>(item, ["description", "Description"]),
      imageUrl: pickAny<string | null | undefined>(item, ["imageUrl", "ImageUrl"]),
      compositeUrl: pickAny<string | null | undefined>(item, ["compositeUrl", "CompositeUrl", "previewCompositeUrl", "PreviewCompositeUrl"]),
      previewCompositeUrl: pickAny<string | null | undefined>(item, ["previewCompositeUrl", "PreviewCompositeUrl", "compositeUrl", "CompositeUrl"]),
      fileUrlOriginal: pickAny<string | null | undefined>(item, ["fileUrlOriginal", "FileUrlOriginal"]),
      fileUrlOptimized: pickAny<string | null | undefined>(item, ["fileUrlOptimized", "FileUrlOptimized"]),
      taskType: pickAny<string | null | undefined>(item, ["taskType", "TaskType"]),
      regionMask: pickAny<string | null | undefined>(item, ["regionMask", "RegionMask"]),
      status: pickAny<string | null | undefined>(item, ["status", "Status", "taskStatus", "TaskStatus"]),
      createdAt: pickAny<string | undefined>(item, ["createdAt", "CreatedAt"]),
      updatedAt: pickAny<string | undefined>(item, ["updatedAt", "UpdatedAt"]),
    })) satisfies QaReviewPageDto[];
  },

  async getQaSessionPins(chapterId: string) {
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] }>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/pins`,
    );
    const items = Array.isArray(data) ? data : data.items ?? data.Items ?? [];
    return items.map(mapQaPin) satisfies QaBugPinDto[];
  },

  async addQaPin(chapterId: string, pageTaskId: string, payload: AddQaPinPayload) {
    return request<string>("qa", `/api/v1/qa/chapters/${chapterId}/pins`, {
      method: "POST",
      body: JSON.stringify({
        pageTaskId,
        coordinateX: payload.CoordinateX,
        coordinateY: payload.CoordinateY,
        noteMessage: payload.NoteMessage,
        issueType: payload.IssueType,
        severity: payload.Severity,
        category: payload.Category,
        batchToken: payload.BatchToken,
      }),
    });
  },

  async updateQaPin(pinId: string, payload: UpdateQaPinPayload) {
    return request<boolean>("qa", `/api/v1/qa/pins/${pinId}`, {
      method: "PATCH",
      body: JSON.stringify({
        noteMessage: payload.NoteMessage,
        issueType: payload.IssueType,
        coordinateX: payload.CoordinateX,
        coordinateY: payload.CoordinateY,
        severity: payload.Severity,
        category: payload.Category,
      }),
    });
  },

  async deleteQaPin(pinId: string) {
    return request<boolean>("qa", `/api/v1/qa/pins/${pinId}`, { method: "DELETE" });
  },

  async completeQaSession(chapterId: string, payload: CompleteQaSessionPayload & { BatchToken?: string }) {
    if (payload.Decision === "Approved") {
      return request("qa", `/api/v1/qa/chapters/${chapterId}/approve`, { method: "POST" });
    }
    return request("qa", `/api/v1/qa/chapters/${chapterId}/send-feedback`, {
      method: "POST",
      body: JSON.stringify({ batchToken: payload.BatchToken }),
    });
  },

  async getQaSummary(chapterId: string) {
    const data = await request<Record<string, unknown>>("qa", `/api/v1/qa/chapters/${chapterId}/summary`);
    return {
      chapterId: pickAny<string>(data, ["chapterId", "ChapterId"]),
      totalPins: pickAny<number>(data, ["totalPins", "TotalPins"]),
      openPins: pickAny<number>(data, ["openPins", "OpenPins"]),
      inFixingPins: pickAny<number>(data, ["inFixingPins", "InFixingPins"]),
      fixedPins: pickAny<number>(data, ["fixedPins", "FixedPins"]),
      resolvedPins: pickAny<number>(data, ["resolvedPins", "ResolvedPins"]),
      canApprove: pickAny<boolean>(data, ["canApprove", "CanApprove"]),
      sessionStatus: pickAny<string | null | undefined>(data, ["sessionStatus", "SessionStatus"]),
    } satisfies QaSummaryDto;
  },

  async getQaFeedbackHistory(chapterId: string) {
    const data = await request<Record<string, unknown>>("qa", `/api/v1/qa/chapters/${chapterId}/feedback`);
    const batches = pickAny<Record<string, unknown>[] | undefined>(data, ["batches", "Batches"]) ?? [];
    return {
      chapterId: pickAny<string>(data, ["chapterId", "ChapterId"]),
      batches: batches.map((batch) => {
        const pins = pickAny<Record<string, unknown>[] | undefined>(batch, ["pins", "Pins"]) ?? [];
        return {
          batchToken: pickAny<string>(batch, ["batchToken", "BatchToken"]),
          sentAt: pickAny<string | null | undefined>(batch, ["sentAt", "SentAt", "createdAt", "CreatedAt"]),
          createdAt: pickAny<string | null | undefined>(batch, ["createdAt", "CreatedAt", "sentAt", "SentAt"]),
          pins: pins.map(mapQaPin),
        };
      }),
    } satisfies QaFeedbackHistoryDto;
  },

  async getQaHistory(chapterId: string) {
    const data = await request<Record<string, unknown>>("qa", `/api/v1/qa/chapters/${chapterId}/history`);
    const sessions = pickAny<Record<string, unknown>[] | undefined>(data, ["sessions", "Sessions"]) ?? [];
    const pins = pickAny<Record<string, unknown>[] | undefined>(data, ["pins", "Pins"]) ?? [];
    return {
      chapterId: pickAny<string>(data, ["chapterId", "ChapterId"]),
      sessions: sessions.map(mapQaSession),
      pins: pins.map(mapQaPin),
    } satisfies QaHistoryDto;
  },

  async reopenQaChapter(chapterId: string) {
    return request("qa", `/api/v1/qa/chapters/${chapterId}/reopen`, { method: "POST" });
  },

  async assignQaFix(pinId: string, payload: AssignQaFixPayload) {
    return request<boolean>("qa", `/api/v1/qa/pins/${pinId}/assign-fix`, {
      method: "POST",
      body: JSON.stringify({
        assistantId: payload.AssistantId,
        instructions: payload.Instructions,
      }),
    });
  },

  async getRevisionTasks(type = "Revision") {
    const mapRevisionTask = (item: Record<string, unknown>) => ({
      id: pickAny<string>(item, ["id", "Id", "taskId", "TaskId"]),
      pinId: pickAny<string>(item, ["pinId", "PinId", "qaPinId", "QaPinId", "relatedPinId", "RelatedPinId", "relatedEntityId", "RelatedEntityId"]),
      chapterId: pickAny<string | undefined>(item, ["chapterId", "ChapterId"]),
      pageId: pickAny<string | undefined>(item, ["pageId", "PageId"]),
      pageNumber: pickAny<number | null | undefined>(item, ["pageNumber", "PageNumber"]),
      description: pickAny<string>(item, ["description", "Description", "note", "Note", "title", "Title"]),
      status: pickAny<string>(item, ["status", "Status"]),
      pinType: pickAny<string | null | undefined>(item, ["pinType", "PinType"]),
      severity: pickAny<string | null | undefined>(item, ["severity", "Severity"]),
      coordinateX: pickAny<number | null | undefined>(item, ["coordinateX", "CoordinateX"]),
      coordinateY: pickAny<number | null | undefined>(item, ["coordinateY", "CoordinateY"]),
      assignedToRole: pickAny<string | null | undefined>(item, ["assignedToRole", "AssignedToRole"]),
      resolvedImageUrl: pickAny<string | null | undefined>(item, ["resolvedImageUrl", "ResolvedImageUrl"]),
      notes: pickAny<string | null | undefined>(item, ["notes", "Notes"]),
    }) satisfies QaRevisionTaskDto;

    const readItems = (data: Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] }) => (
      Array.isArray(data) ? data : data.items ?? data.Items ?? []
    );

    try {
      const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[] }>(
        "task",
        `/api/v1/tasks?type=${encodeURIComponent(type)}`,
      );
      return readItems(data).map(mapRevisionTask);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return [];
      }
      throw error;
    }
  },

  async resolveQaPin(pinId: string, payload: ResolveQaPinPayload) {
    void payload;
    return request<boolean>("qa", `/api/v1/qa/pins/${pinId}/fixed`, { method: "POST" });
  },

  async unresolveQaPin(pinId: string, payload: UnresolveQaPinPayload) {
    void payload;
    return request("qa", `/api/v1/qa/pins/${pinId}/unresolve`, { method: "POST" });
  },

  async closeQaPin(pinId: string, payload?: ResolveQaPinPayload) {
    return request("qa", `/api/v1/qa/pins/${pinId}/resolve`, {
      method: "POST",
      body: payload ? JSON.stringify({
        note: payload.Note ?? payload.Notes,
        reviewedLayerId: payload.ReviewedLayerId,
      }) : undefined,
    });
  },

  async schedulePublication(payload: SchedulePublicationPayload) {
    return request<void>("publishing", "/api/v1/publishing/schedules", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

};
