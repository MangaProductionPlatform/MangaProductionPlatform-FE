import { request } from "./httpClient";

export type QaPin = {
  id: string;
  chapterId: string;
  pageNumber: number;
  xPercent: number;
  yPercent: number;
  issueType: "Visual" | "Content";
  comment: string;
  status?: string;
};

export type CreateQaPinPayload = {
  PageNumber: number;
  XPercent: number;
  YPercent: number;
  IssueType: "Visual" | "Content";
  Comment: string;
};

export const qaService = {
  getPins(chapterId: string) {
    return request<QaPin[]>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/pins`
    );
  },

  createPin(chapterId: string, payload: CreateQaPinPayload) {
    return request<QaPin>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/pins`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  approveChapter(chapterId: string) {
    return request<void>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/approve`,
      {
        method: "POST",
      }
    );
  },
};