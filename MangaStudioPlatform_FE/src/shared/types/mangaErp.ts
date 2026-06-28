export type ServiceName =
  | "identity"
  | "submission"
  | "series"
  | "chapter"
  | "task"
  | "qa"
  | "segmentation"
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
  | "editor_in_chief"
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
  coverImageUrl?: string | null;
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
  description?: string | null;
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
  submitter?: {
    userId: string;
    fullName?: string | null;
    penName?: string | null;
    personalEmail?: string | null;
  } | null;
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
  coverImageUrl?: string | null;
};

export type ActivatePagePayload = {
  pageNumber: number;
  assignedAssistantId: string;
  description?: string | null;
};

export type SetPageRegionPayload = {
  pageNumber: number;
  regionMask: string;
  taskType: string;
};

export type SamEmbeddingResponse = {
  embedding: string;
  shape: number[];
  dtype: string;
  imageSize: number[];
};

export type SamPredictMaskPayload = SamEmbeddingResponse & {
  x: number;
  y: number;
};

export type SamMaskResponse = {
  maskRle?: unknown;
  score: number;
  bbox: number[];
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

export type SubmissionVoteType = "APPROVE" | "REJECT" | "REQ_REVISION";

export type CastSubmissionVotePayload = {
  voteType: SubmissionVoteType;
  comment?: string | null;
  feedbackPins?: RevisionFeedbackPinPayload[];
};

export type CastSubmissionVoteResult = {
  submissionId: string;
  submissionStatus: string;
  totalVotesInRound: number;
  aggregationOutcome?: string | null;
  roundNumber: number;
};

export type ResolveSubmissionConflictPayload = {
  finalDecision: SubmissionVoteType;
  feedbackMessage: string;
};

export type ResolveSubmissionConflictResult = {
  submissionId: string;
  newStatus: string;
  finalDecision: string;
  feedbackMessage: string;
  resolvedAt: string;
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

export type QaSessionDto = {
  id: string;
  chapterId: string;
  editorId: string;
  status: string;
  isApproved: boolean;
  approvedAt?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

export type ImportVotePayload = {
  seriesId: string;
  votePeriod: string;
  voteCount: number;
  importedBy: string;
};
