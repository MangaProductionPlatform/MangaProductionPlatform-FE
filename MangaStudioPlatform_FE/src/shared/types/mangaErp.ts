export type ServiceName =
  | "identity"
  | "submission"
  | "series"
  | "chapter"
  | "task"
  | "qa"
  | "segmentation"
  | "publishing"
  | "media";

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

export type CurrentUserProfileDto = {
  userId: string;
  username: string;
  email: string;
  role: string;
  accountStatus: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  penName?: string | null;
  phoneNumber?: string | null;
  drawingSoftwares?: string[] | null;
  bankAccountNumber?: string | null;
  managingTantouId?: string | null;
  createdAt: string;
};

export type NotificationDto = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  notifyType: string;
  relatedEntityId?: string | null;
  relatedEntityType?: string | null;
  targetUrl?: string | null;
  createdAt: string;
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
  | 4
  | 5;

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

export type AdminRoleDto = {
  value: number;
  name: string;
  description?: string | null;
};

export type AdminDashboardDto = {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    pendingActivation: number;
    suspendedUsers: number;
    totalMangaka: number;
    totalAssistants: number;
    totalTantouEditors: number;
    totalEditorialBoard: number;
    totalEditorInChief: number;
    totalAdmins: number;
  };
  submissionStats: {
    totalSubmissions: number;
    draft: number;
    pendingEBReview: number;
    requiresRevision: number;
    conflictEscalated: number;
    ebApproved: number;
    ebRejected: number;
  };
  seriesStats: {
    totalSeries: number;
    active: number;
    hiatus: number;
    cancelled: number;
    pendingCancellationRequests: number;
  };
  generatedAt: string;
};

export type AdminDashboardFilters = {
  startDate?: string;
  endDate?: string;
};

export type AdminChartGroupBy = "day" | "month";

export type AdminTrendDataPointDto = {
  date: string;
  count: number;
};

export type AdminChartsDto = {
  submissionTrends: AdminTrendDataPointDto[];
  seriesTrends: AdminTrendDataPointDto[];
  generatedAt: string;
};

export type AdminWorkflowStatsDto = {
  generatedAt: string;
  submissionStats: Array<{ status: string; count: number }>;
  chapterStats: Array<{ status: string; count: number }>;
  taskStats: Array<{ status: string; count: number }>;
};

export type RankingPeriod = "Daily" | "Weekly" | "Monthly" | "AllTime";

export type RankingItemDto = {
  seriesId: string;
  title?: string | null;
  rank?: number | null;
  period?: string | null;
  score?: number | null;
  votesCount?: number | null;
  viewsCount?: number | null;
};

export type RankingListDto = {
  period?: string | null;
  generatedAt?: string | null;
  items: RankingItemDto[];
};

export type EditorDashboardDto = {
  overview: {
    assignedSeriesCount: number;
    chaptersWaitingForQa: number;
    chaptersInRevision: number;
    pinsAwaitingVerification: number;
    approvedThisMonth: number;
  };
  qaQueue: Array<{ id: string; title: string; chapterNumber: number; seriesId: string; submittedAt?: string | null }>;
  revisionWatchlist: Array<{
    id: string;
    title: string;
    chapterNumber: number;
    seriesId: string;
    pins: { open: number; inFixing: number; fixed: number };
  }>;
  upcomingPublishing: Array<{ id: string; title: string; chapterNumber: number; seriesId: string; scheduledPublishAt?: string | null }>;
  recentActivity: Array<{ action: string; description?: string | null; timestamp: string }>;
};

export type BoardDashboardDto = {
  overview: {
    proposalsWaitingForVote: number;
    conflictsAwaitingResolution: number;
    chaptersReadyForPublish: number;
    scheduledPublicationsThisWeek: number;
    cancellationRequestsPending: number;
  };
  proposalQueue: Array<{ id: string; title: string; submitterId: string; submittedAt?: string | null }>;
  publishingQueue: Array<{ id: string; seriesId: string; title: string; chapterNumber: number; approvedAt?: string | null }>;
  upcomingSchedule: Array<{ id: string; seriesId: string; title: string; chapterNumber: number; scheduledPublishAt?: string | null }>;
  cancellationQueue: Array<{ id: string; title: string; requestedAt?: string | null; reason?: string | null }>;
  rankingSnapshot: Array<{ seriesId: string; score: number; rank: number; calculatedAt?: string | null }>;
  recentActivity: Array<{ action: string; description?: string | null; timestamp: string }>;
};

export type PublishingScheduleItemDto = {
  chapterId: string;
  seriesId: string;
  title: string;
  chapterNumber: number;
  issueType?: string | null;
  scheduledPublishAt: string;
};

export type CancellationQueueItemDto = {
  seriesId: string;
  title: string;
  status?: string | null;
  reason?: string | null;
  requestedById?: string | null;
  requestedAt?: string | null;
};

export type BoardReportDto = {
  generatedAt?: string | null;
  submissions: { totalInReview: number; pendingEB: number; conflictEscalated: number; approvedThisMonth: number; rejectedThisMonth: number };
  cancellations: { pendingApproval: number; approvedThisMonth: number; rejectedThisMonth: number };
};

export type BoardPerformanceReportDto = {
  generatedAt: string;
  totalSubmissions: number;
  totalResolved: number;
  totalPending: number;
  totalConflict: number;
  approveRate: number;
  rejectRate: number;
  revisionRate: number;
  avgProcessingHours: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  voteBreakdown: Array<{ voteType: string; count: number }>;
  submissionsPerMonth: Array<{ year: number; month: number; count: number }>;
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

export type RecommendedAssistantDto = {
  assistantId: string;
  assistantName: string;
  avatarUrl?: string | null;
  penName?: string | null;
  activeTasksCount: number;
};

export type AssistantIncomeDto = {
  totalFinishedTasks: number;
  estimatedIncome: number;
  currency: string;
  ratePerTask: number;
};

export type StudioTasksBoardDto = {
  seriesId: string;
  chapters: Array<{
    chapterId: string;
    chapterTitle: string;
    chapterNumber: number;
    tasks: Array<{
      taskId: string;
      pageNumber: number;
      status: string;
      taskType: string;
      description?: string | null;
      deadline?: string | null;
      assistantId?: string | null;
      assistantName?: string | null;
      assistantAvatarUrl?: string | null;
    }>;
  }>;
};

export type PageTaskDto = {
  id: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  pageNumber: number;
  status: string;
  assignedAssistantId?: string | null;
  baseImageUrl?: string | null;
  imageUrl?: string | null;
  previewCompositeUrl?: string | null;
  description?: string | null;
  taskType?: string | null;
  regionMask?: string | null;
  deadline?: string | null;
  currentLayerType?: string | null;
  currentLayerVersion?: number | null;
  fileUrlOriginal?: string | null;
  fileUrlOptimized?: string | null;
  submissionNote?: string | null;
  rejectionNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LayerType = "LineArt" | "Background" | "Coloring" | "Text" | "Effects" | "Dialogue";

export type SubmitPageLayerPayload = {
  LayerType: LayerType;
  FileUrlOriginal: string;
  FileUrlOptimized?: string | null;
};

export type ReviewPageTaskPayload = {
  IsAccepted: boolean;
  RejectionNote?: string | null;
};

export type BulkReviewPageTaskPayload = {
  Reviews: Array<{
    PageTaskId: string;
    IsAccepted: boolean;
    RejectionNote?: string | null;
  }>;
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

export type MediaUploadResult = {
  url: string;
  fileKey: string;
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
  SeriesId: string;
  Title: string;
  ChapterNumber: number;
  TotalPages: number;
  AssignedEditorId?: string | null;
  CoverImageUrl?: string | null;
};

export type ActivatePagePayload = {
  PageNumber: number;
  AssignedAssistantId: string;
  Description?: string | null;
  Deadline?: string | null;
};

export type BulkActivatePagesPayload = {
  PageNumbers: number[];
  AssignedAssistantId: string;
  Description?: string | null;
  Deadline?: string | null;
};

export type ReassignPageTaskPayload = {
  NewAssistantId: string;
  Description?: string | null;
};

export type UpdateTaskDeadlinePayload = {
  Deadline?: string | null;
};

export type SetPageRegionPayload = {
  pageNumber: number;
  regionMask: string;
  taskType: string;
};

export type LayerHistoryDto = {
  layerId: string;
  pageTaskId: string;
  pageNumber: number;
  layerType: string;
  fileUrlOriginal: string;
  fileUrlOptimized: string;
  version: number;
  isCurrentVersion: boolean;
  rejectionNote?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  status: string;
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

export type PublicationType = "Weekly" | "Monthly" | "Special";

export type SchedulePublicationPayload = {
  ChapterId: string;
  SeriesId: string;
  IssueType: PublicationType;
  ScheduledPublishAt: string;
};

export type ReadyForPublishChapterDto = {
  chapterId: string;
  seriesId: string;
  title: string;
  chapterNumber: number;
  coverImageUrl?: string | null;
  issueType?: PublicationType | string | null;
  scheduledPublishAt?: string | null;
  createdAt: string;
};

export type PublishChapterResult = {
  chapterId: string;
  status: string;
  publicationUrl: string;
  publishedAt: string;
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

export type EditorialDecision = "Approved" | "Rejected";

export type EditorialReviewAssignmentDto = {
  id: string;
  workType: string;
  workId: string;
  roundNumber: number;
  status: string;
  decision?: EditorialDecision | null;
  feedback?: string | null;
  assignedAt?: string | null;
  reviewedAt?: string | null;
};

export type EditorialReviewDetailDto = EditorialReviewAssignmentDto & {
  bothComplete: boolean;
  completedReviews?: Array<{
    reviewerId: string;
    decision?: EditorialDecision | null;
    feedback?: string | null;
    reviewedAt?: string | null;
  }> | null;
};

export type EditorialDecisionPayload = {
  decision: EditorialDecision;
  feedback?: string | null;
};

export type EditorialDecisionResult = {
  status: string;
  peerReviewConfidential?: boolean;
};

export type EditorialConflictItemDto = {
  id: string;
  title: string;
  workType: string;
  roundNumber?: number | null;
};

export type EditorialConflictsDto = {
  submissions: EditorialConflictItemDto[];
  chapters: EditorialConflictItemDto[];
};

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

export type SubmissionVoteDetailDto = {
  editorId: string;
  voteType: SubmissionVoteType;
  comment?: string | null;
  votedAt: string;
};

export type SubmissionVotesDto = {
  submissionId: string;
  submissionTitle: string;
  round: number;
  totalVotes: number;
  approveCount: number;
  rejectCount: number;
  revisionCount: number;
  votes: SubmissionVoteDetailDto[];
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
  CoordinateX: number;
  CoordinateY: number;
  IssueType: string;
  NoteMessage: string;
  Severity: string;
  Category?: string;
  BatchToken: string;
};

export type UpdateQaPinPayload = {
  NoteMessage?: string;
  IssueType?: string;
  CoordinateX?: number;
  CoordinateY?: number;
  Severity?: string;
  Category?: string;
};

export type AssignQaFixPayload = {
  AssistantId: string;
  Instructions?: string;
};

export type QaBugPinDto = {
  id: string;
  chapterId?: string;
  pageTaskId?: string;
  pageId?: string;
  editorId?: string;
  coordinateX: number;
  coordinateY: number;
  noteMessage?: string;
  description?: string;
  issueType?: string | null;
  pinType?: string | null;
  severity?: string | null;
  category?: string | null;
  assignedToRole?: string | null;
  batchToken?: string;
  resolvedImageUrl?: string | null;
  notes?: string | null;
  status: string;
  resolvedAt?: string | null;
  createdAt?: string;
};

export type QaPinDto = {
  pinId: string;
  pageTaskId: string;
  coordinateX: number;
  coordinateY: number;
  issueType: string;
  noteMessage: string;
  status: string;
  createdAt: string;
};

export type QaSessionDto = {
  chapterId: string;
  batchToken?: string;
  totalPins?: number;
  resolvedPins?: number;
  pendingPins?: number;
  status: string;
  id?: string;
  sessionId?: string;
  qaSessionId?: string;
  editorId?: string;
  isApproved?: boolean;
  approvedAt?: string | null;
  createdAt?: string;
  completedAt?: string | null;
  generalFeedback?: string | null;
};

export type QaSummaryDto = {
  chapterId: string;
  totalPins: number;
  openPins: number;
  inFixingPins: number;
  fixedPins: number;
  resolvedPins: number;
  canApprove: boolean;
  sessionStatus?: string | null;
};

export type QaQueueChapterDto = {
  chapterId: string;
  seriesId?: string | null;
  seriesTitle?: string | null;
  title: string;
  chapterNumber?: number | null;
  status: string;
  totalPages?: number | null;
  deadline?: string | null;
  submittedAt?: string | null;
};

export type QaReviewPageDto = {
  pageId: string;
  pageTaskId: string;
  pageNumber: number;
  description?: string | null;
  imageUrl?: string | null;
  baseImageUrl?: string | null;
  compositeUrl?: string | null;
  previewCompositeUrl?: string | null;
  fileUrlOriginal?: string | null;
  fileUrlOptimized?: string | null;
  taskType?: string | null;
  regionMask?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type QaFeedbackBatchDto = {
  batchToken: string;
  sentAt?: string | null;
  createdAt?: string | null;
  pins: QaBugPinDto[];
};

export type QaFeedbackHistoryDto = {
  chapterId: string;
  batches: QaFeedbackBatchDto[];
};

export type QaHistoryDto = {
  chapterId: string;
  sessions: QaSessionDto[];
  pins: QaBugPinDto[];
};

export type StartQaSessionPayload = {
  ReviewMode: "Standard";
  Notes?: string;
};

export type CompleteQaSessionPayload = {
  Decision: "RequiresRevision" | "Approved";
  GeneralFeedback: string;
};

export type ResolveQaPinPayload = {
  ResolvedImageUrl?: string;
  Notes?: string;
  Note?: string;
  ReviewedLayerId?: string;
};

export type UnresolveQaPinPayload = {
  Reason: string;
};

export type QaRevisionTaskDto = {
  id: string;
  pinId: string;
  chapterId?: string;
  pageId?: string;
  pageNumber?: number | null;
  description: string;
  status: string;
  pinType?: string | null;
  severity?: string | null;
  coordinateX?: number | null;
  coordinateY?: number | null;
  assignedToRole?: string | null;
  resolvedImageUrl?: string | null;
  notes?: string | null;
};

export type ImportVotePayload = {
  seriesId: string;
  votePeriod: string;
  voteCount: number;
  importedBy: string;
};
