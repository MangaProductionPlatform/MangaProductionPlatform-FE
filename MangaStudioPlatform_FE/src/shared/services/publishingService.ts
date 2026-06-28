import { request } from "./httpClient";

export type ReleaseType = "Weekly" | "Monthly" | "Special";

export type SchedulePublicationPayload = {
  ChapterId: string;
  ReleaseType: ReleaseType;
  PublishAt: string;
};

export const publishingService = {
  schedulePublication(payload: SchedulePublicationPayload) {
    return request<void>("publishing", "/api/v1/publishing/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  publish(chapterId: string) {
    return request<void>("publishing", "/api/v1/publishing/publish", {
      method: "POST",
      body: JSON.stringify({
        ChapterId: chapterId,
      }),
    });
  },

  getSeriesHistory(seriesId: string) {
    return request("publishing", `/api/v1/publishing/series/${seriesId}/history`);
  },
};