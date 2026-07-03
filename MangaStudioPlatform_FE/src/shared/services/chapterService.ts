import { request } from "./httpClient";

export type CreateChapterPayload = {
  SeriesId: string;
  Title: string;
  ChapterNumber: number;
  TotalPages: number;
  AssignedEditorId?: string | null;
  CoverImageUrl?: string | null;
};

export type CreateBasePagePayload = {
  PageNumber: number;
};

export type ActivatePageTaskPayload = {
  PageNumber: number;
  AssignedAssistantId: string;
  Description?: string | null;
  Deadline?: string | null;
};

export type SetPageRegionPayload = {
  PageNumber: number;
  RegionMask: string;
  TaskType: string;
};

export const chapterService = {
  createChapter(payload: CreateChapterPayload) {
    return request("chapter", "/api/v1/chapters", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getChapter(chapterId: string) {
    return request("chapter", `/api/v1/chapters/${chapterId}`);
  },

  createBasePage(chapterId: string, pageNumber: number) {
  return request("chapter", `/api/v1/chapters/${chapterId}/pages`, {
    method: "POST",
    body: JSON.stringify({
      PageNumber: pageNumber,
    }),
  });
  },

  activatePageTask(chapterId: string, payload: ActivatePageTaskPayload) {
    return request("chapter", `/api/v1/chapters/${chapterId}/pages/activate`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setPageRegion(chapterId: string, payload: SetPageRegionPayload) {
    return request("chapter", `/api/v1/chapters/${chapterId}/pages/region`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  submitForQa(chapterId: string) {
    return request("chapter", `/api/v1/chapters/${chapterId}/submit-for-qa`, {
      method: "POST",
    });
  },
};
