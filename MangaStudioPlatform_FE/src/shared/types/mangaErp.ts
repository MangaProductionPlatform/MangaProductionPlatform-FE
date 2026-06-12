export type ServiceName =
  | "identity"
  | "submission"
  | "series"
  | "chapter"
  | "task"
  | "qa"
  | "publishing"
  | "ranking";

export type ApiErrorBody = {
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

export type ProvisionRole =
  | 1
  | 2
  | 3
  | 4;

export type AdminUserDto = {
  userId: string;
  username: string;
  fullName?: string | null;
  role: string;
  accountStatus: string;
  personalEmail?: string | null;
  createdAt: string;
  phoneNumber?: string | null;
  penName?: string | null;
  drawingSoftwares?: string[] | null;
  bankAccountNumber?: string | null;
  managingTantouId?: string | null;
};

export type ListUsersResult = {
  users: AdminUserDto[];
  totalCount: number;
};

export type ProvisionAccountPayload = {
  fullName: string;
  personalEmail: string;
  role: ProvisionRole;
  phoneNumber?: string | null;
  managingTantouId?: string | null;
};

export type ProvisionAccountResult = {
  userId: string;
  generatedUsername: string;
  personalEmail: string;
  role: string;
  status: string;
};

export type ActivateAccountPayload = {
  token: string;
  password: string;
  penName?: string | null;
  drawingSoftwares?: string[] | null;
  bankAccountNumber?: string | null;
};

export type ActivateAccountResult = {
  userId: string;
  username: string;
  role: string;
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
