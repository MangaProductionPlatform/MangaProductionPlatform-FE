import type { AppRole, ChapterDto, MangaSeriesDto, SubmissionDetailDto, SubmissionSummaryDto } from "../types/mangaErp";

export function pick<T>(value: Record<string, unknown>, key: string): T {
  return (value[key] ?? value[`${key[0].toUpperCase()}${key.slice(1)}`]) as T;
}

export function normalizeRole(role: string): AppRole {
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

export function mapSeries(item: Record<string, unknown>): MangaSeriesDto {
  return {
    id: pick<string>(item, "id"),
    title: pick<string>(item, "title"),
    description: pick<string | null | undefined>(item, "description"),
    genre: pick<string | null | undefined>(item, "genre"),
    coverImageUrl: pick<string | null | undefined>(item, "coverImageUrl"),
    status: pick<string>(item, "status"),
    authorId: pick<string | null | undefined>(item, "authorId"),
    submissionId: pick<string | null | undefined>(item, "submissionId"),
    createdAt: pick<string>(item, "createdAt"),
  };
}

export function mapSubmissionSummary(item: Record<string, unknown>): SubmissionSummaryDto {
  return {
    id: pick<string>(item, "id"),
    title: pick<string>(item, "title"),
    genre: pick<string | null | undefined>(item, "genre"),
    status: pick<string>(item, "status"),
    feedbackMessage: pick<string | null | undefined>(item, "feedbackMessage"),
    createdAt: pick<string>(item, "createdAt"),
    reviewedAt: pick<string | null | undefined>(item, "reviewedAt"),
  };
}

export function mapSubmissionDetail(item: Record<string, unknown>): SubmissionDetailDto {
  return {
    ...mapSubmissionSummary(item),
    description: pick<string | null | undefined>(item, "description"),
    coverImageUrl: pick<string | null | undefined>(item, "coverImageUrl"),
    manuscriptUrl: pick<string | null | undefined>(item, "manuscriptUrl"),
    submitterId: pick<string>(item, "submitterId"),
    editorRecommendationMessage: pick<string | null | undefined>(item, "editorRecommendationMessage"),
    assignedEditorId: pick<string | null | undefined>(item, "assignedEditorId"),
    reviewedByUserId: pick<string | null | undefined>(item, "reviewedByUserId"),
  };
}

export function mapChapter(item: Record<string, unknown>): ChapterDto {
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
