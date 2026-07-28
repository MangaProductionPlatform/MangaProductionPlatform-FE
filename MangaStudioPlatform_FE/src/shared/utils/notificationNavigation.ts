import type { AppRole, NotificationDto } from "../types/mangaErp";

function withEntity(path: string, entityId?: string | null) {
  return entityId ? `${path}?id=${encodeURIComponent(entityId)}` : path;
}

export function getNotificationTarget(
  notification: NotificationDto,
  role?: AppRole | string | null,
) {
  const targetUrl = notification.targetUrl?.trim();

  if (targetUrl) {
    if (/^https?:\/\//i.test(targetUrl)) return targetUrl;

    if (targetUrl.startsWith("/app/board/submissions")) {
      const query = targetUrl.includes("?")
        ? targetUrl.slice(targetUrl.indexOf("?"))
        : notification.relatedEntityId
          ? `?id=${encodeURIComponent(notification.relatedEntityId)}`
          : "";
      return `/app/board/series-proposals${query}`;
    }

    if (targetUrl.startsWith("/app/assistant/tasks")) {
      return targetUrl.replace("/app/assistant/tasks", "/assistant/tasks");
    }

    return targetUrl;
  }

  const relatedId = notification.relatedEntityId;

  switch (notification.notifyType) {
    case "NewSubmissionPendingReview":
    case "SubmissionVoteCast":
    case "SubmissionConflictEscalated":
      return withEntity("/app/board/series-proposals", relatedId);
    case "SubmissionRevisionRequired":
    case "SubmissionRejected":
      return withEntity("/mangaka/submissions", relatedId);
    case "SubmissionApproved":
      return "/mangaka/series";
    case "TantouEditorAssigned":
    case "ChapterReadyForQA":
      return "/app/editor/dashboard";
    case "Chapter_ReadyForPublishing":
    case "QA_Approved":
      return withEntity("/app/board/publishing-schedule", relatedId);
    case "QA_Feedback":
      return withEntity("/mangaka/qa-submission", relatedId);
    case "TaskAssigned":
    case "RevisionRequired":
    case "TaskApproved":
      return role === "assistant"
        ? relatedId ? `/assistant/tasks/${relatedId}` : "/assistant/tasks"
        : relatedId ? `/app/tasks/${relatedId}` : "/app/tasks";
    case "SegmentationTaskAssigned":
      return "/assistant/tasks";
    case "StudioInvitation":
      return "/assistant/dashboard";
    default:
      break;
  }

  if (notification.relatedEntityType === "Submission") {
    return role === "editorial_board" || role === "editor_in_chief"
      ? withEntity("/app/board/series-proposals", relatedId)
      : withEntity("/mangaka/submissions", relatedId);
  }

  if (notification.relatedEntityType === "PageTask") {
    return role === "assistant"
      ? relatedId ? `/assistant/tasks/${relatedId}` : "/assistant/tasks"
      : relatedId ? `/app/tasks/${relatedId}` : "/app/tasks";
  }

  if (notification.relatedEntityType === "Chapter") {
    return role === "editorial_board" || role === "editor_in_chief"
      ? withEntity("/app/board/publishing-schedule", relatedId)
      : withEntity("/app/chapters", relatedId);
  }

  return null;
}

