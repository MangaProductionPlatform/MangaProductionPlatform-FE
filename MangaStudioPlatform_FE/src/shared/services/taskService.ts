import { request } from "./httpClient";

export type SubmitLayerPayload = {
  LayerType: "LineArt" | "Color" | "Background" | "Text";
  FileUrlOriginal: string;
  FileUrlOptimized?: string | null;
};

export type ReviewLayerPayload = {
  IsAccepted: boolean;
  RejectionNote?: string;
};

export const taskService = {
  getAssignedTasks(status?: string) {
    const query = status ? `?status=${status}` : "";

    return request("task", `/api/v1/tasks/assigned${query}`);
  },

  submitLayer(pageTaskId: string, payload: SubmitLayerPayload) {
    return request("task", `/api/v1/tasks/${pageTaskId}/layers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getChapterTasks(chapterId: string) {
    return request("task", `/api/v1/tasks/chapter/${chapterId}`);
  },

  reviewLayer(pageTaskId: string, payload: ReviewLayerPayload) {
    return request("task", `/api/v1/tasks/${pageTaskId}/review`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
