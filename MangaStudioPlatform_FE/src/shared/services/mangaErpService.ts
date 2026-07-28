import type {
  ActivatePagePayload,
  ActivateAccountPayload,
  ActivateAccountResult,
  AdminDashboardDto,
  AdminDashboardFilters,
  AdminChartGroupBy,
  AdminChartsDto,
  AdminRoleDto,
  AdminWorkflowStatsDto,
  AssistantIncomeDto,
  AdminUserDto,
  BasePageVersionDto,
  BoardDashboardDto,
  BoardPerformanceReportDto,
  BoardReportDto,
  BulkActivatePagesPayload,
  BulkReviewPageTaskPayload,
  CastSubmissionVotePayload,
  CastSubmissionVoteResult,
  CreateChapterPayload,
  CreateSubmissionPayload,
  CurrentUser,
  CurrentUserProfileDto,
  CancellationQueueItemDto,
  EditorDashboardDto,
  EditorialConflictsDto,
  EditorialDecisionPayload,
  EditorialDecisionResult,
  EditorialReviewAssignmentDto,
  EditorialReviewDetailDto,
  EditorialSubmissionListItemDto,
  AddQaPinPayload,
  AssignAssistantToMangakaPayload,
  EndCollaborationPayload,
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
  PublishChapterResult,
  PublishingScheduleItemDto,
  RankingListDto,
  RankingPeriod,
  ReadyForPublishChapterDto,
  RecommendedAssistantDto,
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
  TaskAssistantCandidatesDto,
  TaskCheckpointDto,
  TaskProgressDto,
  StartQaSessionPayload,
  SubmissionDetailDto,
  SubmissionSummaryDto,
  SubmissionVotesDto,
  StudioInvitationDto,
  StudioTasksBoardDto,
  UpdateProfilePayload,
  UpdateAdminAccountPayload,
  UpdateQaPinPayload,
  UpdateTaskDetailsPayload,
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

export type AssistantCandidateDto = {
  assistantId: string;
  displayName: string;
  email: string;
  activeTaskCount: number | null;
  pendingAssignmentCount: number | null;
  totalWorkload: number | null;
  maxWorkload: number | null;
  remainingCapacity: number | null;
  hasSeriesAccess: boolean;
  isAvailable: boolean;
  availabilityCode?: string | null;
  availabilityReason?: string | null;
  collaborationId?: string | null;
  concurrencyToken?: string | null;
  expectedConcurrencyToken?: string | null;
};

function pickAny<T>(value: Record<string, unknown>, keys: string[]): T {
  for (const key of keys) {
    const candidate = value[key];
    if (candidate !== undefined) return candidate as T;
  }
  return undefined as T;
}

function pickNonEmptyString(
  value: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function pickNullableNumber(
  value: Record<string, unknown>,
  keys: string[],
) {
  const candidate = pickAny<unknown>(value, keys);

  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate;
  }

  if (typeof candidate === "string" && candidate.trim()) {
    const parsed = Number(candidate);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function pickBoolean(value: Record<string, unknown>, keys: string[]) {
  const candidate = pickAny<unknown>(value, keys);

  if (typeof candidate === "boolean") {
    return candidate;
  }

  if (typeof candidate === "string") {
    return candidate.toLowerCase() === "true";
  }

  return false;
}

function getRecordArray(
  value: unknown,
  keys: string[],
): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    );
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      );
    }
  }

  return [];
}

function mapAssistantCandidate(
  item: Record<string, unknown>,
): AssistantCandidateDto {
  return {
    assistantId: pickNonEmptyString(item, [
      "assistantId",
      "AssistantId",
      "assistantUserId",
      "AssistantUserId",
      "userId",
      "UserId",
      "id",
      "Id",
    ]),
    displayName: pickNonEmptyString(item, [
      "displayName",
      "DisplayName",
      "assistantName",
      "AssistantName",
      "name",
      "Name",
    ]),
    email: pickNonEmptyString(item, ["email", "Email"]),
    activeTaskCount: pickNullableNumber(item, [
      "activeTaskCount",
      "ActiveTaskCount",
      "activeTasksCount",
      "ActiveTasksCount",
    ]),
    pendingAssignmentCount: pickNullableNumber(item, [
      "pendingAssignmentCount",
      "PendingAssignmentCount",
    ]),
    totalWorkload: pickNullableNumber(item, [
      "totalWorkload",
      "TotalWorkload",
    ]),
    maxWorkload: pickNullableNumber(item, ["maxWorkload", "MaxWorkload"]),
    remainingCapacity: pickNullableNumber(item, [
      "remainingCapacity",
      "RemainingCapacity",
    ]),
    hasSeriesAccess: pickBoolean(item, ["hasSeriesAccess", "HasSeriesAccess"]),
    isAvailable: pickBoolean(item, ["isAvailable", "IsAvailable"]),
    availabilityCode: pickAny<string | null | undefined>(item, [
      "availabilityCode",
      "AvailabilityCode",
    ]),
    availabilityReason: pickAny<string | null | undefined>(item, [
      "availabilityReason",
      "AvailabilityReason",
    ]),
    collaborationId: pickAny<string | null | undefined>(item, [
      "collaborationId",
      "CollaborationId",
    ]),
    concurrencyToken: pickAny<string | null | undefined>(item, [
      "concurrencyToken",
      "ConcurrencyToken",
    ]),
    expectedConcurrencyToken: pickAny<string | null | undefined>(item, [
      "expectedConcurrencyToken",
      "ExpectedConcurrencyToken",
    ]),
  };
}

function mapBasePageVersion(item: Record<string, unknown>): BasePageVersionDto {
  return {
    id: pickAny<string | undefined>(item, [
      "id",
      "Id",
      "basePageId",
      "BasePageId",
    ]),
    version: pickAny<number | undefined>(item, [
      "version",
      "Version",
      "versionNumber",
      "VersionNumber",
    ]),
    baseImageUrl: pickAny<string | null | undefined>(item, [
      "baseImageUrl",
      "BaseImageUrl",
      "imageUrl",
      "ImageUrl",
      "fileUrl",
      "FileUrl",
    ]),
    createdAt: pickAny<string | null | undefined>(item, [
      "createdAt",
      "CreatedAt",
      "uploadedAt",
      "UploadedAt",
    ]),
    isCurrent: pickAny<boolean | undefined>(item, [
      "isCurrent",
      "IsCurrent",
      "isLatest",
      "IsLatest",
    ]),
  };
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

function mapEditorialReviewAssignment(item: Record<string, unknown>): EditorialReviewAssignmentDto {
  return {
    id: pickAny<string>(item, ["id", "Id"]),
    workType: String(pickAny<string>(item, ["workType", "WorkType"])),
    workId: pickAny<string>(item, ["workId", "WorkId"]),
    roundNumber: pickAny<number>(item, ["roundNumber", "RoundNumber", "round", "Round"]),
    status: String(pickAny<string>(item, ["status", "Status"])),
    decision: pickAny<EditorialReviewAssignmentDto["decision"]>(item, ["decision", "Decision"]),
    feedback: pickAny<string | null | undefined>(item, ["feedback", "Feedback"]),
    assignedAt: pickAny<string | null | undefined>(item, ["assignedAt", "AssignedAt"]),
    reviewedAt: pickAny<string | null | undefined>(item, ["reviewedAt", "ReviewedAt"]),
  };
}

function mapEditorialConflictItem(item: Record<string, unknown>) {
  return {
    id: pickAny<string>(item, ["id", "Id", "workId", "WorkId"]),
    title: pickAny<string>(item, ["title", "Title"]),
    workType: String(pickAny<string>(item, ["workType", "WorkType"])),
    roundNumber: pickAny<number | null | undefined>(item, ["roundNumber", "RoundNumber", "currentRound", "CurrentRound", "round", "Round"]),
  };
}

function toQueryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

function mapAdminCharts(data: Record<string, unknown>): AdminChartsDto {
  const mapPoint = (item: Record<string, unknown>) => ({
    date: pickAny<string>(item, ["date", "Date"]),
    count: pickAny<number>(item, ["count", "Count"]),
  });
  const submissionTrends =
    pickAny<Record<string, unknown>[] | undefined>(data, ["submissionTrends", "SubmissionTrends"]) ?? [];
  const seriesTrends =
    pickAny<Record<string, unknown>[] | undefined>(data, ["seriesTrends", "SeriesTrends"]) ?? [];
  return {
    submissionTrends: submissionTrends.map(mapPoint),
    seriesTrends: seriesTrends.map(mapPoint),
    generatedAt: pickAny<string>(data, ["generatedAt", "GeneratedAt"]),
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

  async getCurrentUserProfile() {
    return request<CurrentUserProfileDto>("identity", "/api/v1/users/me");
  },

  async listUsers(filters: { roleFilter?: number; statusFilter?: number; } = {}) {
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

  async getUnassignedAssistants(): Promise<AssistantCandidateDto[]> {
    const data = await request<unknown>(
      "identity",
      "/api/v1/admin/unassigned-assistants",
    );

    return getRecordArray(data, ["items", "Items", "assistants", "Assistants"])
      .map(mapAssistantCandidate);
  },

  async getAdminMangakaAssistants(
    mangakaId: string,
  ): Promise<AssistantCandidateDto[]> {
    const data = await request<unknown>(
      "identity",
      `/api/v1/admin/mangakas/${encodeURIComponent(mangakaId)}/assistants`,
    );

    return getRecordArray(data, ["items", "Items", "assistants", "Assistants"])
      .map(mapAssistantCandidate);
  },

  async assignAssistantToMangaka(
    assistantId: string,
    payload: AssignAssistantToMangakaPayload,
  ) {
    return request<void>(
      "identity",
      `/api/v1/admin/assistants/${encodeURIComponent(assistantId)}/assign-mangaka`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  async endStudioCollaboration(
    collaborationId: string,
    payload: EndCollaborationPayload,
  ) {
    return request<void>(
      "identity",
      `/api/v1/studios/collaborations/${encodeURIComponent(collaborationId)}/end`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
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
    return request<{ message: string; }>("identity", `/api/v1/admin/accounts/${id}/resend-activation`, {
      method: "POST",
    });
  },

  async deleteUser(id: string) {
    return request<{ message: string; }>("identity", `/api/v1/admin/accounts/${id}`, {
      method: "DELETE",
    });
  },

  async getAdminDashboard(filters: AdminDashboardFilters = {}) {
    const query = toQueryString(filters);
    return request<AdminDashboardDto>("identity", `/api/v1/admin/dashboard${query}`);
  },

  async getAdminCharts(filters: AdminDashboardFilters & { groupBy?: AdminChartGroupBy } = {}) {
    const data = await request<Record<string, unknown>>(
      "identity",
      `/api/v1/admin/charts${toQueryString(filters)}`,
    );
    return mapAdminCharts(data);
  },

  async getAdminWorkflowStats() {
    return request<AdminWorkflowStatsDto>("identity", "/api/v1/admin/workflow-stats");
  },

  async getAdminRoles() {
    const data = await request<{ roles?: AdminRoleDto[]; Roles?: AdminRoleDto[]; }>("identity", "/api/v1/admin/roles");
    return data.roles ?? data.Roles ?? [];
  },

  async updateSamConfig(payload: { Url: string; InternalApiKey: string; }) {
    return request<{ message: string; }>("identity", "/api/v1/admin/sam-config", {
      method: "PATCH",
      body: JSON.stringify(payload),
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
    return request<{ message: string; }>("identity", "/api/v1/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getMySeries() {
    const data = await request<Record<string, unknown>[]>("series", "/api/v1/series/my");
    return data.map(mapSeries);
  },

  async getMyManagedAssistants(): Promise<AssistantCandidateDto[]> {
    const data = await request<unknown>(
      "series",
      "/api/v1/mangakas/me/assistants",
    );

    return getRecordArray(data, ["items", "Items", "assistants", "Assistants"])
      .map(mapAssistantCandidate);
  },

  async getSeries(id: string) {
    const data = await request<Record<string, unknown>>("series", `/api/v1/series/${id}`);
    return mapSeries(data);
  },

  async getMangakaDashboard() {
    return request<Record<string, unknown>>("series", "/api/v1/mangaka/dashboard");
  },

  async getAdminSettings() {
    return request<Record<string, unknown>>("identity", "/api/v1/admin/settings");
  },

  async updateAdminSettings(payload: Record<string, unknown>) {
    return request<Record<string, unknown> | void>("identity", "/api/v1/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async getModerationQueue() {
    return request<Record<string, unknown>[]>("identity", "/api/v1/moderation/queue");
  },

  async getModerationDetail(id: string) {
    return request<Record<string, unknown>>("identity", `/api/v1/moderation/${id}`);
  },

  async approveModeration(id: string) {
    return request<void>("identity", `/api/v1/moderation/${id}/approve`, { method: "POST" });
  },

  async rejectModeration(id: string) {
    return request<void>("identity", `/api/v1/moderation/${id}/reject`, { method: "POST" });
  },

  async hideModerationContent(id: string) {
    return request<void>("identity", `/api/v1/moderation/${id}/hide`, { method: "POST" });
  },

  async resolveModeration(id: string) {
    return request<void>("identity", `/api/v1/moderation/${id}/resolve`, { method: "POST" });
  },

  async getSeriesAnalytics(seriesId: string) {
    return request<Record<string, unknown>>("series", `/api/v1/series/${seriesId}/analytics`);
  },

  async getAllSeries(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const data = await request<Record<string, unknown>[]>("series", `/api/v1/series${query}`);
    return data.map(mapSeries);
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
    return request<{ submissionId?: string; SubmissionId?: string; }>(
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

  async getMediaItems() {
    return request<Record<string, unknown>[]>("media", "/api/v1/media");
  },

  async getMediaQuota() {
    return request<Record<string, unknown>>("media", "/api/v1/media/quota");
  },

  async deleteMedia(publicId: string) {
    return request<void>("media", `/api/v1/media/${encodeURIComponent(publicId)}`, { method: "DELETE" });
  },

  async exportBoardReports() {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null") as { accessToken?: string; } | null;
    const response = await fetch(`${API_BASE_URL ?? ""}/api/v1/board/reports/export?format=csv`, {
      headers: user?.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {},
    });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    return response.blob();
  },

  async getSubmissionReviewResults(id: string) {
    return request<Record<string, unknown>>("submission", `/api/v1/manuscripts/${id}/review-results`);
  },

  async getSubmissionQueue(): Promise<SubmissionSummaryDto[]> {
    const data = await request<Record<string, unknown>[]>("submission", "/api/v1/submissions/queue");
    return data.map(mapSubmissionSummary);
  },

  async getEditorialReviews() {
    const data = await request<Record<string, unknown>[]>("submission", "/api/v1/editorial-workflow/reviews");
    return data.map(mapEditorialReviewAssignment);
  },

  async getEditorialAllSubmissions(): Promise<EditorialSubmissionListItemDto[]> {
    const data = await request<Record<string, unknown>[]>("submission", "/api/v1/editorial-workflow/all-submissions");
    return data.map((item) => ({
      id: pickAny<string>(item, ["id", "Id"]),
      title: pickAny<string>(item, ["title", "Title"]),
      status: String(pickAny<string>(item, ["status", "Status"])),
      submitterId: pickAny<string | null | undefined>(item, ["submitterId", "SubmitterId"]),
      currentRound: pickAny<number | null | undefined>(item, ["currentRound", "CurrentRound", "roundNumber", "RoundNumber"]),
      feedbackMessage: pickAny<string | null | undefined>(item, ["feedbackMessage", "FeedbackMessage"]),
      createdAt: pickAny<string | null | undefined>(item, ["createdAt", "CreatedAt"]),
    }));
  },

  async getEditorialReviewDetail(assignmentId: string): Promise<EditorialReviewDetailDto> {
    const data = await request<Record<string, unknown>>("submission", `/api/v1/editorial-workflow/reviews/${assignmentId}`);
    const detail = mapEditorialReviewAssignment(data);
    const completedReviews =
      pickAny<Record<string, unknown>[] | null | undefined>(data, ["completedReviews", "CompletedReviews"]) ?? null;
    return {
      ...detail,
      bothComplete: Boolean(pickAny<boolean | undefined>(data, ["bothComplete", "BothComplete"])),
      completedReviews: completedReviews?.map((item) => ({
        reviewerId: pickAny<string>(item, ["reviewerId", "ReviewerId"]),
        decision: pickAny<EditorialReviewAssignmentDto["decision"]>(item, ["decision", "Decision"]),
        feedback: pickAny<string | null | undefined>(item, ["feedback", "Feedback"]),
        reviewedAt: pickAny<string | null | undefined>(item, ["reviewedAt", "ReviewedAt"]),
      })) ?? null,
    };
  },

  async submitEditorialReviewDecision(assignmentId: string, payload: EditorialDecisionPayload) {
    return request<EditorialDecisionResult>("submission", `/api/v1/editorial-workflow/reviews/${assignmentId}/decision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getEditorialConflicts(): Promise<EditorialConflictsDto> {
    const data = await request<Record<string, unknown>>("submission", "/api/v1/editorial-workflow/conflicts");
    const submissions = pickAny<Record<string, unknown>[] | undefined>(data, ["submissions", "Submissions"]) ?? [];
    const chapters = pickAny<Record<string, unknown>[] | undefined>(data, ["chapters", "Chapters"]) ?? [];
    return {
      submissions: submissions.map(mapEditorialConflictItem),
      chapters: chapters.map(mapEditorialConflictItem),
    };
  },

  async getEditorialConflictDetail(workType: string, workId: string) {
    return request<Record<string, unknown>>("submission", `/api/v1/editorial-workflow/conflicts/${workType}/${workId}`);
  },

  async resolveEditorialConflict(workType: string, workId: string, payload: EditorialDecisionPayload) {
    return request<EditorialDecisionResult>("submission", `/api/v1/editorial-workflow/conflicts/${workType}/${workId}/decision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
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

  async cancelSeriesInvitation(invitationId: string) {
    return request<void>("series", `/api/v1/studios/invitations/${invitationId}/cancel`, { method: "POST" });
  },

  async getStudioTasksBoard(seriesId: string): Promise<StudioTasksBoardDto> {
    return request<StudioTasksBoardDto>("chapter", `/api/v1/studios/${seriesId}/tasks/board`);
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

  async getEditorChapterQueue() {
    const data = await request<Record<string, unknown>[]>("chapter", "/api/v1/chapters/my-queue");
    return data.map((chapter) => ({
      id: pickAny<string>(chapter, ["chapterId", "ChapterId", "id", "Id"]),
      seriesId: pickAny<string>(chapter, ["seriesId", "SeriesId"]),
      title: pickAny<string>(chapter, ["title", "Title"]),
      chapterNumber: pickAny<number>(chapter, ["chapterNumber", "ChapterNumber"]),
      totalPages: pickAny<number>(chapter, ["totalPages", "TotalPages"]),
      status: pickAny<string>(chapter, ["status", "Status"]),
      createdAt: pickAny<string | undefined>(chapter, ["createdAt", "CreatedAt"]),
      approvedPages: pickAny<number | undefined>(chapter, ["approvedPages", "ApprovedPages"]),
      progressPercent: pickAny<number | undefined>(chapter, ["progressPercent", "ProgressPercent"]),
    }));
  },

  async getChapter(id: string) {
    const data = await request<Record<string, unknown>>("chapter", `/api/v1/chapters/${id}`);
    return mapChapter(data);
  },

  async getRecommendedAssistants(chapterId: string): Promise<RecommendedAssistantDto[]> {
    const data = await request<Record<string, unknown>[]>("chapter", `/api/v1/chapters/${chapterId}/recommend-assistants`);
    return data.map((item) => ({
      assistantId: pickNonEmptyString(item, [
        "assistantId",
        "AssistantId",
        "assistantID",
        "AssistantID",
        "assistantUserId",
        "AssistantUserId",
        "assistantUserID",
        "AssistantUserID",
        "userId",
        "UserId",
        "identityUserId",
        "IdentityUserId",
        "id",
        "Id",
      ]),
      assistantName: pickAny<string>(item, ["assistantName", "AssistantName", "fullName", "FullName", "name", "Name"]),
      avatarUrl: pickAny<string | null | undefined>(item, ["avatarUrl", "AvatarUrl"]),
      penName: pickAny<string | null | undefined>(item, ["penName", "PenName"]),
      activeTasksCount: pickAny<number>(item, ["activeTasksCount", "ActiveTasksCount"]),
    }));
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

  async addBasePage(
    chapterId: string,
    pageNumber: number,
    baseImageUrl: string,
  ) {
    return request("chapter", `/api/v1/chapters/${chapterId}/pages`, {
      method: "POST",
      body: JSON.stringify({
        PageNumber: pageNumber,
        BaseImageUrl: baseImageUrl,
      }),
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
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }>(
      "task",
      `/api/v1/tasks/assigned${query}`,
    );
    const items = Array.isArray(data) ? data : data.items ?? data.Items ?? [];
    return items.map(mapPageTask);
  },

  async getAssistantSubmissions() {
    return request<Record<string, unknown>[]>("task", "/api/v1/assistants/submissions");
  },

  async getTaskQaPin(pageTaskId: string) {
    return request<Record<string, unknown> | null>("qa", `/api/v1/qa/tasks/${pageTaskId}/qa-pin`);
  },

  async getAssistantIncome(): Promise<AssistantIncomeDto> {
    return request<AssistantIncomeDto>("task", "/api/v1/assistant/tasks/income");
  },

  async getChapterPageTasks(chapterId: string) {
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }>(
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

  async getTaskAssistantCandidates(
    pageTaskId: string,
  ): Promise<TaskAssistantCandidatesDto> {
    const data = await request<unknown>(
      "task",
      `/api/v1/tasks/${pageTaskId}/assistant-candidates`,
    );

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {
        availableAssistants: [],
        unavailableAssistants: [],
      };
    }

    const response = data as Record<string, unknown>;

    return {
      availableAssistants: getRecordArray(response, [
        "availableAssistants",
        "AvailableAssistants",
      ]).map(mapAssistantCandidate),
      unavailableAssistants: getRecordArray(response, [
        "unavailableAssistants",
        "UnavailableAssistants",
      ]).map(mapAssistantCandidate),
    };
  },

  async getChapterAssistantCandidates(
    chapterId: string,
  ): Promise<TaskAssistantCandidatesDto> {
    const data = await request<unknown>(
      "chapter",
      `/api/v1/chapters/${chapterId}/assistant-candidates`,
    );

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {
        availableAssistants: [],
        unavailableAssistants: [],
      };
    }

    const response = data as Record<string, unknown>;

    return {
      availableAssistants: getRecordArray(response, [
        "availableAssistants",
        "AvailableAssistants",
      ]).map(mapAssistantCandidate),
      unavailableAssistants: getRecordArray(response, [
        "unavailableAssistants",
        "UnavailableAssistants",
      ]).map(mapAssistantCandidate),
    };
  },

  async getTaskProgress(pageTaskId: string): Promise<TaskProgressDto> {
    const data = await request<Record<string, unknown>>(
      "task",
      `/api/v1/tasks/${pageTaskId}/progress`,
    );

    return {
      progressPercent: pickNullableNumber(data, [
        "progressPercent",
        "ProgressPercent",
        "percentage",
        "Percentage",
        "progress",
        "Progress",
      ]),
      status: pickAny<string | null | undefined>(data, ["status", "Status"]),
      updatedAt: pickAny<string | null | undefined>(data, [
        "updatedAt",
        "UpdatedAt",
        "lastUpdatedAt",
        "LastUpdatedAt",
      ]),
      updatedBy: pickAny<string | null | undefined>(data, [
        "updatedBy",
        "UpdatedBy",
        "updatedByName",
        "UpdatedByName",
      ]),
    };
  },

  async getTaskCheckpoints(pageTaskId: string): Promise<TaskCheckpointDto[]> {
    const data = await request<unknown>(
      "task",
      `/api/v1/tasks/${pageTaskId}/checkpoints`,
    );

    return getRecordArray(data, [
      "items",
      "Items",
      "checkpoints",
      "Checkpoints",
      "data",
      "Data",
    ]).map((item) => ({
      id: pickAny<string | null | undefined>(item, ["id", "Id"]),
      title: pickAny<string | null | undefined>(item, [
        "title",
        "Title",
        "name",
        "Name",
      ]),
      description: pickAny<string | null | undefined>(item, [
        "description",
        "Description",
        "note",
        "Note",
      ]),
      status: pickAny<string | null | undefined>(item, ["status", "Status"]),
      createdAt: pickAny<string | null | undefined>(item, [
        "createdAt",
        "CreatedAt",
      ]),
      updatedAt: pickAny<string | null | undefined>(item, [
        "updatedAt",
        "UpdatedAt",
      ]),
      completedAt: pickAny<string | null | undefined>(item, [
        "completedAt",
        "CompletedAt",
      ]),
    }));
  },

  async updateTaskDetails(
    pageTaskId: string,
    payload: UpdateTaskDetailsPayload,
  ) {
    return request<void>("task", `/api/v1/tasks/${pageTaskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async getBasePageVersions(pageTaskId: string) {
    const data = await request<
      | Record<string, unknown>[]
      | {
          items?: Record<string, unknown>[];
          Items?: Record<string, unknown>[];
          versions?: Record<string, unknown>[];
          Versions?: Record<string, unknown>[];
          basePageVersions?: Record<string, unknown>[];
          BasePageVersions?: Record<string, unknown>[];
        }
    >("task", `/api/v1/tasks/${pageTaskId}/base-pages/versions`);

    const items = Array.isArray(data)
      ? data
      : data.items ??
        data.Items ??
        data.versions ??
        data.Versions ??
        data.basePageVersions ??
        data.BasePageVersions ??
        [];

    return items.map(mapBasePageVersion);
  },

  async cancelAndRecreateTask(pageTaskId: string) {
    return request<void>(
      "task",
      `/api/v1/tasks/${pageTaskId}/cancel-and-recreate`,
      { method: "POST" },
    );
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
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }>(
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
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }>(
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
      baseImageUrl: pickAny<string | null | undefined>(item, ["baseImageUrl", "BaseImageUrl"]),
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
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }>(
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

  async completeQaSession(chapterId: string, payload: CompleteQaSessionPayload & { BatchToken?: string; }) {
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

    const readItems = (data: Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }) => (
      Array.isArray(data) ? data : data.items ?? data.Items ?? []
    );

    try {
      const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }>(
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
    return request<void>("publishing", "/api/v1/publishing/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async markNotificationRead(notificationId: string) {
    return request<void>("publishing", `/api/v1/notifications/${notificationId}/read`, { method: "PATCH" });
  },

  async getUnreadNotificationCount() {
    const data = await request<Record<string, unknown>>("publishing", "/api/v1/notifications/unread-count");
    return pickAny<number>(data, ["unreadCount", "UnreadCount"]);
  },

  async markAllNotificationsRead() {
    return request<void>("publishing", "/api/v1/notifications/read-all", { method: "PATCH" });
  },

  async deleteNotification(notificationId: string) {
    return request<void>("publishing", `/api/v1/notifications/${notificationId}`, { method: "DELETE" });
  },

  async deleteAllReadNotifications() {
    return request<void>("publishing", "/api/v1/notifications", { method: "DELETE" });
  },

  async publishChapter(chapterId: string) {
    return request<PublishChapterResult>("publishing", "/api/v1/publishing/publish", {
      method: "POST",
      body: JSON.stringify({ ChapterId: chapterId }),
    });
  },

  async getReadyForPublish() {
    const data = await request<Record<string, unknown>[] | { items?: Record<string, unknown>[]; Items?: Record<string, unknown>[]; }>(
      "publishing",
      "/api/v1/publishing/chapters/ready",
    );
    const items = Array.isArray(data) ? data : data.items ?? data.Items ?? [];
    return items.map((item) => ({
      chapterId: pickAny<string>(item, ["chapterId", "ChapterId", "id", "Id"]),
      seriesId: pickAny<string>(item, ["seriesId", "SeriesId"]),
      title: pickAny<string>(item, ["title", "Title", "chapterTitle", "ChapterTitle"]),
      chapterNumber: pickAny<number>(item, ["chapterNumber", "ChapterNumber"]),
      coverImageUrl: pickAny<string | null | undefined>(item, ["coverImageUrl", "CoverImageUrl"]),
      issueType: pickAny<string | null | undefined>(item, ["issueType", "IssueType"]),
      scheduledPublishAt: pickAny<string | null | undefined>(item, ["scheduledPublishAt", "ScheduledPublishAt"]),
      createdAt: pickAny<string>(item, ["createdAt", "CreatedAt"]),
    })) satisfies ReadyForPublishChapterDto[];
  },

  async getEditorDashboard(): Promise<EditorDashboardDto> {
    return request<EditorDashboardDto>("qa", "/api/v1/editor/dashboard");
  },

  async getBoardDashboard(): Promise<BoardDashboardDto> {
    return request<BoardDashboardDto>("submission", "/api/v1/board/dashboard");
  },

  async getPublishingSchedule(): Promise<PublishingScheduleItemDto[]> {
    const data = await request<Record<string, unknown>[]>("publishing", "/api/v1/publishing/schedule");
    return data.map((item) => ({
      chapterId: pickAny<string>(item, ["chapterId", "ChapterId", "id", "Id"]),
      seriesId: pickAny<string>(item, ["seriesId", "SeriesId"]),
      title: pickAny<string>(item, ["title", "Title", "chapterTitle", "ChapterTitle"]),
      chapterNumber: pickAny<number>(item, ["chapterNumber", "ChapterNumber"]),
      issueType: pickAny<string | null | undefined>(item, ["issueType", "IssueType"]),
      scheduledPublishAt: pickAny<string>(item, ["scheduledPublishAt", "ScheduledPublishAt"]),
    }));
  },

  async updatePublicationSchedule(chapterId: string, payload: SchedulePublicationPayload) {
    return request<void>("publishing", `/api/v1/publishing/chapters/${chapterId}/schedule`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async cancelPublicationSchedule(chapterId: string) {
    return request<void>("publishing", `/api/v1/publishing/chapters/${chapterId}/schedule`, { method: "DELETE" });
  },

  async getPublishingQueue() {
    return request<Record<string, unknown>[]>("publishing", "/api/v1/publishing/chapters/my-queue");
  },

  async getCancellationQueue(): Promise<CancellationQueueItemDto[]> {
    const data = await request<Record<string, unknown>[]>("series", "/api/v1/series/cancellation-queue");
    return data.map((item) => ({
      seriesId: pickAny<string>(item, ["seriesId", "SeriesId", "id", "Id"]),
      title: pickAny<string>(item, ["title", "Title", "seriesTitle", "SeriesTitle"]),
      status: pickAny<string | null | undefined>(item, ["status", "Status", "cancellationStatus", "CancellationStatus"]),
      reason: pickAny<string | null | undefined>(item, ["reason", "Reason", "cancellationReason", "CancellationReason"]),
      requestedById: pickAny<string | null | undefined>(item, ["requestedById", "RequestedById", "cancellationRequestedById", "CancellationRequestedById"]),
      requestedAt: pickAny<string | null | undefined>(item, ["requestedAt", "RequestedAt", "cancellationRequestedAt", "CancellationRequestedAt"]),
    }));
  },

  async approveCancellation(seriesId: string) {
    return request<void>("series", `/api/v1/series/${seriesId}/approve-cancellation`, { method: "POST" });
  },

  async rejectCancellation(seriesId: string, reason: string) {
    return request<void>("series", `/api/v1/series/${seriesId}/reject-cancellation`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async getBoardReports(): Promise<BoardReportDto> {
    return request<BoardReportDto>("submission", "/api/v1/board/reports");
  },

  async getBoardPerformanceReports(): Promise<BoardPerformanceReportDto> {
    return request<BoardPerformanceReportDto>("submission", "/api/v1/board/performance-reports");
  },

  async getRankings(period: RankingPeriod = "Weekly", limit = 10) {
    const data = await request<Record<string, unknown> | Record<string, unknown>[]>(
      "publishing",
      `/api/v1/rankings?period=${encodeURIComponent(period)}&limit=${encodeURIComponent(String(limit))}`,
    );
    const items = Array.isArray(data)
      ? data
      : pickAny<Record<string, unknown>[] | undefined>(data, ["items", "Items", "rankings", "Rankings"]) ?? [];
    return {
      period: Array.isArray(data) ? period : pickAny<string | null | undefined>(data, ["period", "Period"]),
      generatedAt: Array.isArray(data) ? undefined : pickAny<string | null | undefined>(data, ["generatedAt", "GeneratedAt"]),
      items: items.map((item) => ({
        seriesId: pickAny<string>(item, ["seriesId", "SeriesId"]),
        title: pickAny<string | null | undefined>(item, ["title", "Title", "seriesTitle", "SeriesTitle"]),
        rank: pickAny<number | null | undefined>(item, ["rank", "Rank"]),
        period: pickAny<string | null | undefined>(item, ["period", "Period"]),
        score: pickAny<number | null | undefined>(item, ["score", "Score"]),
        votesCount: pickAny<number | null | undefined>(item, ["votesCount", "VotesCount", "votes", "Votes"]),
        viewsCount: pickAny<number | null | undefined>(item, ["viewsCount", "ViewsCount", "views", "Views"]),
      })),
    } satisfies RankingListDto;
  },

  async refreshRankings() {
    return request("publishing", "/api/v1/rankings/refresh", { method: "POST" });
  },

};
