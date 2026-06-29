import { request } from "./httpClient";

export type QaIssueType = "Lineart" | "Coloring" | "Text" | "Layout";

export type QaPin = {
  id: string;
  pinId?: string;
  chapterId: string;
  pageTaskId: string;
  coordinateX: number;
  coordinateY: number;
  noteMessage: string;
  issueType: QaIssueType;
  batchToken: string;
  status?: string;
};

export type CreateQaPinPayload = {
  pageTaskId: string;
  coordinateX: number;
  coordinateY: number;
  noteMessage: string;
  issueType: QaIssueType;
  batchToken: string;
};

export const qaService = {
  createPin(chapterId: string, payload: CreateQaPinPayload) {
    return request<QaPin>("qa", `/api/v1/qa/chapters/${chapterId}/pins`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getPins(chapterId: string) {
  return request<QaPin[]>(
    "qa",
    `/api/v1/qa/chapters/${chapterId}/pins`
  );
  },

  sendFeedback(chapterId: string, batchToken: string) {
    return request<void>(
      "qa",
      `/api/v1/qa/chapters/${chapterId}/send-feedback`,
      {
        method: "POST",
        body: JSON.stringify({ batchToken }),
      }
    );
  },

  resolvePin(pinId: string) {
    return request<void>("qa", `/api/v1/qa/pins/${pinId}/resolve`, {
      method: "POST",
    });
  },

  approveChapter(chapterId: string) {
    return request<void>("qa", `/api/v1/qa/chapters/${chapterId}/approve`, {
      method: "POST",
    });
  },
};