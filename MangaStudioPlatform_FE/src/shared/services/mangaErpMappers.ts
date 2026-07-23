import type { AppRole, ChapterDto, MangaSeriesDto, PageTaskDto, SubmissionDetailDto, SubmissionSummaryDto } from "../types/mangaErp";

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
    EditorInChief: "editor_in_chief",
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
    submitter: pick<SubmissionDetailDto["submitter"]>(item, "submitter"),
    editorRecommendationMessage: pick<string | null | undefined>(item, "editorRecommendationMessage"),
    assignedEditorId: pick<string | null | undefined>(item, "assignedEditorId"),
    reviewedByUserId: pick<string | null | undefined>(item, "reviewedByUserId"),
  };
}

export function mapChapter(item: Record<string, unknown>, knownSeriesId?: string): ChapterDto {
  const rawPageTasks =
    pick<Record<string, unknown>[] | null | undefined>(item, "pages") ??
    pick<Record<string, unknown>[] | null | undefined>(item, "pageTasks") ?? [];

  return {
    id:
    pick<string>(item, "id") ??
    pick<string>(item, "chapterId") ??
    pick<string>(item, "ChapterId") ??
    pick<string>(item, "Id"),
    seriesId: pick<string>(item, "seriesId") ?? knownSeriesId ?? "",
    title: pick<string>(item, "title"),
    chapterNumber: Number(pick<number>(item, "chapterNumber")),
    totalPages: Number(pick<number>(item, "totalPages")),
    status: pick<string>(item, "status"),
    coverImageUrl: pick<string | null | undefined>(item, "coverImageUrl"),
    assignedEditorId: pick<string | null | undefined>(item, "assignedEditorId"),
    scheduledPublishAt: pick<string | null | undefined>(item, "scheduledPublishAt"),
    publishedAt: pick<string | null | undefined>(item, "publishedAt"),
    createdAt: pick<string>(item, "createdAt"),
    approvedPages: Number(pick<number>(item, "approvedPages") ?? 0),
    progressPercent: Number(pick<number>(item, "progressPercent") ?? 0),
    pageTasks: rawPageTasks.map(mapPageTask),
  };
}

export function mapPageTask(item: Record<string, unknown>): PageTaskDto {
  return {
    id: pick<string>(item, "id") ?? pick<string>(item, "pageTaskId"),
    chapterId: pick<string | undefined>(item, "chapterId"),
    chapterTitle: pick<string | undefined>(item, "chapterTitle"),
    chapterNumber: Number(pick<number | undefined>(item, "chapterNumber")) || undefined,
    pageNumber: Number(pick<number>(item, "pageNumber")),
    status: pick<string>(item, "status") ?? pick<string>(item, "taskStatus") ?? "Unknown",
    assignedAssistantId: pick<string | null | undefined>(item, "assignedAssistantId"),
    baseImageUrl: pick<string | null | undefined>(item, "baseImageUrl"),
    imageUrl: pick<string | null | undefined>(item, "imageUrl"),
    previewCompositeUrl: pick<string | null | undefined>(item, "previewCompositeUrl"),
    description: pick<string | null | undefined>(item, "description"),
    taskType: pick<string | null | undefined>(item, "taskType"),
    regionMask: pick<string | null | undefined>(item, "regionMask"),
    deadline: pick<string | null | undefined>(item, "deadline"),
    currentLayerType: pick<string | null | undefined>(item, "currentLayerType"),
    currentLayerVersion: pick<number | null | undefined>(item, "currentLayerVersion"),
    fileUrlOriginal: pick<string | null | undefined>(item, "fileUrlOriginal"),
    fileUrlOptimized: pick<string | null | undefined>(item, "fileUrlOptimized"),
    submissionNote: pick<string | null | undefined>(item, "submissionNote") ?? pick<string | null | undefined>(item, "note"),
    rejectionNote: pick<string | null | undefined>(item, "rejectionNote"),
    createdAt: pick<string | undefined>(item, "createdAt"),
    updatedAt: pick<string | undefined>(item, "updatedAt"),
  };
}
