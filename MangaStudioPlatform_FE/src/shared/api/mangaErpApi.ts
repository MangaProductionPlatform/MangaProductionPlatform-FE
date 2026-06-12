type ServiceName =
  | "identity"
  | "submission"
  | "series"
  | "chapter"
  | "task"
  | "qa"
  | "publishing"
  | "ranking";

declare global {
  interface Window {
    __APP_CONFIG__?: {
      VITE_API_BASE_URL?: string;
      VITE_IDENTITY_API_BASE_URL?: string;
      VITE_SUBMISSION_API_BASE_URL?: string;
      VITE_SERIES_API_BASE_URL?: string;
      VITE_CHAPTER_API_BASE_URL?: string;
      VITE_TASK_API_BASE_URL?: string;
      VITE_QA_API_BASE_URL?: string;
      VITE_PUBLISHING_API_BASE_URL?: string;
      VITE_RANKING_API_BASE_URL?: string;
    };
  }
}

const runtimeConfig = typeof window !== "undefined" ? window.__APP_CONFIG__ : undefined;

function envUrl(key: keyof NonNullable<Window["__APP_CONFIG__"]>) {
  const value = (runtimeConfig?.[key] ?? import.meta.env[key])?.replace(/\/$/, "");
  return value || undefined;
}

const API_BASE_URL = envUrl("VITE_API_BASE_URL");

const SERVICE_BASE_URLS: Record<ServiceName, string> = {
  identity:
    envUrl("VITE_IDENTITY_API_BASE_URL") ??
    API_BASE_URL ??
    "/identity",
  submission:
    envUrl("VITE_SUBMISSION_API_BASE_URL") ??
    API_BASE_URL ??
    "/submission",
  series:
    envUrl("VITE_SERIES_API_BASE_URL") ??
    API_BASE_URL ??
    "/series",
  chapter:
    envUrl("VITE_CHAPTER_API_BASE_URL") ??
    API_BASE_URL ??
    "/chapter",
  task:
    envUrl("VITE_TASK_API_BASE_URL") ??
    API_BASE_URL ??
    "/task",
  qa:
    envUrl("VITE_QA_API_BASE_URL") ??
    API_BASE_URL ??
    "/qa",
  publishing:
    envUrl("VITE_PUBLISHING_API_BASE_URL") ??
    API_BASE_URL ??
    "/publishing",
  ranking:
    envUrl("VITE_RANKING_API_BASE_URL") ??
    API_BASE_URL ??
    "/ranking",
};

type ApiErrorBody = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

export type CurrentUser = {
  userId: string;
  email: string;
  role: AppRole;
  accessToken: string;
  refreshToken: string;
};

export type AppRole =
  | "reader"
  | "mangaka"
  | "assistant"
  | "editor"
  | "editorial_board"
  | "admin";

export type RegisterRole =
  | "Reader"
  | "Mangaka"
  | "Assistant"
  | "TantouEditor"
  | "EditorialBoard";

const registerRoleValue: Record<RegisterRole, number> = {
  Reader: 0,
  Mangaka: 1,
  Assistant: 2,
  TantouEditor: 3,
  EditorialBoard: 4,
};

export type MangaSeriesDto = {
  id: string;
  title: string;
  description?: string | null;
  genre?: string | null;
  coverImageUrl?: string | null;
  status: string;
  authorId: string;
  createdAt: string;
};

export type ChapterDto = {
  id: string;
  seriesId: string;
  title: string;
  chapterNumber: number;
  totalPages: number;
  status: string;
  assignedEditorId?: string | null;
  scheduledPublishAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  pageTasks?: PageTaskDto[];
};

export type PageTaskDto = {
  id: string;
  pageNumber: number;
  status: string;
  assignedAssistantId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RankingBoardItemDto = {
  rank: number;
  seriesId: string;
  totalVotes: number;
  votePeriod: string;
};

export type CreateSubmissionPayload = {
  submitterId: string;
  title: string;
  description?: string | null;
  genre?: string | null;
  coverImageUrl?: string | null;
  manuscriptUrl: string;
};

export type CreateChapterPayload = {
  seriesId: string;
  title: string;
  chapterNumber: number;
  totalPages: number;
  assignedEditorId?: string | null;
};

export type ActivatePagePayload = {
  pageNumber: number;
  assignedAssistantId: string;
};

export type SubmissionFeedbackPayload = {
  feedbackMessage: string;
};

export type RecommendSubmissionPayload = SubmissionFeedbackPayload & {
  reviewerEditorId: string;
};

export type ReviewSubmissionPayload = SubmissionFeedbackPayload & {
  reviewerUserId: string;
};

export type SchedulePublicationPayload = {
  chapterId: string;
  seriesId: string;
  issueType: string;
  scheduledPublishAt: string;
};

export type ImportVotePayload = {
  seriesId: string;
  votePeriod: string;
  voteCount: number;
  importedBy: string;
};

function readUser(): CurrentUser | null {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = readUser()?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function pick<T>(value: Record<string, unknown>, key: string): T {
  return (value[key] ?? value[`${key[0].toUpperCase()}${key.slice(1)}`]) as T;
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

async function request<T>(
  service: ServiceName,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  Object.entries(authHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(`${SERVICE_BASE_URLS[service]}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await parseErrorBody(response);
    const validationErrors = body.errors
      ? Object.values(body.errors).flat().join(" ")
      : "";
    throw new Error(
      validationErrors ||
        body.message ||
        body.title ||
        `API error ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function normalizeRole(role: string): AppRole {
  const roleMap: Record<string, AppRole> = {
    Reader: "reader",
    Mangaka: "mangaka",
    Assistant: "assistant",
    TantouEditor: "editor",
    EditorialBoard: "editorial_board",
    Admin: "admin",
  };

  return roleMap[role] ?? role.toLowerCase() as AppRole;
}

function mapSeries(item: Record<string, unknown>): MangaSeriesDto {
  return {
    id: pick<string>(item, "id"),
    title: pick<string>(item, "title"),
    description: pick<string | null | undefined>(item, "description"),
    genre: pick<string | null | undefined>(item, "genre"),
    coverImageUrl: pick<string | null | undefined>(item, "coverImageUrl"),
    status: pick<string>(item, "status"),
    authorId: pick<string>(item, "authorId"),
    createdAt: pick<string>(item, "createdAt"),
  };
}

function mapChapter(item: Record<string, unknown>): ChapterDto {
  const rawPageTasks =
    pick<Record<string, unknown>[] | null | undefined>(item, "pageTasks") ?? [];

  return {
    id: pick<string>(item, "id"),
    seriesId: pick<string>(item, "seriesId"),
    title: pick<string>(item, "title"),
    chapterNumber: Number(pick<number>(item, "chapterNumber")),
    totalPages: Number(pick<number>(item, "totalPages")),
    status: pick<string>(item, "status"),
    assignedEditorId: pick<string | null | undefined>(item, "assignedEditorId"),
    scheduledPublishAt: pick<string | null | undefined>(item, "scheduledPublishAt"),
    publishedAt: pick<string | null | undefined>(item, "publishedAt"),
    createdAt: pick<string>(item, "createdAt"),
    pageTasks: rawPageTasks.map((pageTask) => ({
      id: pick<string>(pageTask, "id"),
      pageNumber: Number(pick<number>(pageTask, "pageNumber")),
      status: pick<string>(pageTask, "status"),
      assignedAssistantId: pick<string | null | undefined>(pageTask, "assignedAssistantId"),
      createdAt: pick<string>(pageTask, "createdAt"),
      updatedAt: pick<string>(pageTask, "updatedAt"),
    })),
  };
}

export const mangaErpApi = {
  baseUrl: API_BASE_URL ?? "vite local proxy",
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

  async register(payload: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role: RegisterRole;
  }) {
    return request("identity", "/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        role: registerRoleValue[payload.role],
      }),
    });
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
