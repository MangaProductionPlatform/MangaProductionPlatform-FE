import { request } from "./httpClient";

export type ImportVotePayload = {
  SeriesId: string;
  VotePeriod: string;
  RawVotes: number;
};

export const rankingService = {
  importVote(payload: ImportVotePayload) {
    return request<void>("ranking", "/api/v1/ranking/votes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getRankingBoard(votePeriod: string) {
    return request(
      "ranking",
      `/api/v1/ranking/board?votePeriod=${encodeURIComponent(votePeriod)}`
    );
  },
};