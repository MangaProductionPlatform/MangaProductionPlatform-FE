export type ServiceName =
  | "identity"
  | "submission"
  | "series"
  | "chapter"
  | "task"
  | "qa"
  | "publishing";

export type ApiErrorBody = {
  message?: string;
  title?: string;
  error?: string;
  errors?: Record<string, string[]>;
  details?: Array<{ field?: string; message?: string }>;
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
  authorId?: string | null;
  submissionId?: string | null;
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
  createdAt?: string;
  approvedPages?: number;
  progressPercent?: number;
  pageTasks?: PageTaskDto[];
};

export type PageTaskDto = {
  id: string;
  pageNumber: number;
  status: string;
  assignedAssistantId?: string | null;
  previewCompositeUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RankingBoardItemDto = {
  rank: number;
  seriesId: string;
  totalVotes: number;
  votePeriod: string;
};

export type CreateSubmissionPayload = {
  title: string;
  description?: string | null;
  genre?: string | null;
  coverImageUrl?: string | null;
  manuscriptUrl?: string | null;
};

export type UpdateSubmissionMetadataPayload = {
  title: string;
  description?: string | null;
  genre?: string | null;
  coverImageUrl?: string | null;
};

export type UpdateSubmissionManuscriptPayload = {
  manuscriptUrl: string;
};

export type SubmissionSummaryDto = {
  id: string;
  title: string;
  genre?: string | null;
  status: string;
  feedbackMessage?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

export type SubmissionDetailDto = SubmissionSummaryDto & {
  description?: string | null;
  coverImageUrl?: string | null;
  manuscriptUrl?: string | null;
  submitterId: string;
  editorRecommendationMessage?: string | null;
  assignedEditorId?: string | null;
  reviewedByUserId?: string | null;
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

export type RecommendSubmissionPayload = {
  recommendationMessage: string;
};

export type ReviewSubmissionPayload = {
  reason: string;
};

export type UpdateProfilePayload = {
  penName?: string | null;
  drawingSoftwares?: string[] | null;
  bankAccountNumber?: string | null;
};

export type SchedulePublicationPayload = {
  chapterId: string;
  seriesId: string;
  issueType: string;
  scheduledPublishAt: string;
};

export type UpdateAdminAccountPayload = {
  fullName: string;
  personalEmail: string;
  role: number;
  phoneNumber?: string | null;
  managingTantouId?: string | null;
};

export type RevisionFeedbackPinPayload = {
  pageIdentifier: string;
  coordinateX: number;
  coordinateY: number;
  comment: string;
  category: number;
};

export type RequestRevisionPayload = {
  reason: string;
  pins?: RevisionFeedbackPinPayload[];
};

export type FeedbackPinDto = {
  id: string;
  pageIdentifier: string;
  coordinateX: number;
  coordinateY: number;
  comment: string;
  category: string;
  createdByUserId: string;
  isArchived: boolean;
  createdAt: string;
};

export type StudioInvitationDto = {
  invitationId: string;
  seriesId: string;
  inviterMangakaId: string;
  assistantEmail: string;
  message?: string | null;
  status: string;
  expiresAt: string;
};

export type InviteAssistantPayload = {
  assistantEmail: string;
  message?: string | null;
};

export type AddQaPinPayload = {
  pageTaskId: string;
  coordinateX: number;
  coordinateY: number;
  noteMessage: string;
  issueType: string;
  batchToken: string;
};

export type QaBugPinDto = {
  id: string;
  chapterId: string;
  pageTaskId: string;
  editorId: string;
  coordinateX: number;
  coordinateY: number;
  noteMessage: string;
  issueType?: string | null;
  batchToken: string;
  status: string;
  resolvedAt?: string | null;
  createdAt: string;
};

export type ImportVotePayload = {
  seriesId: string;
  votePeriod: string;
  voteCount: number;
  importedBy: string;
};
