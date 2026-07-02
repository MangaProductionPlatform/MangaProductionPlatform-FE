import type { ChapterDto, PageTaskDto } from "../types/mangaErp";

const acceptableStatuses = new Set([
  "approved",
  "accepted",
  "complete",
  "completed",
]);

function normalizeStatus(status?: string | null) {
  return status?.replace(/[\s_-]/g, "").toLowerCase() ?? "";
}

export type ChapterQaReadiness = {
  isReady: boolean;
  approvedTaskCount: number;
  expectedPageCount: number | null;
  missingPages: number[];
  issues: string[];
};

export function evaluateChapterQaReadiness(
  chapter: ChapterDto | null | undefined,
  tasks: PageTaskDto[],
): ChapterQaReadiness {
  const issues: string[] = [];
  const expectedPageCount = Number.isInteger(chapter?.totalPages)
    && Number(chapter?.totalPages) > 0
    ? Number(chapter?.totalPages)
    : null;
  const validTasks = tasks.filter(
    (task) => Number.isInteger(task.pageNumber) && task.pageNumber > 0,
  );

  if (expectedPageCount === null) {
    issues.push(
      "The backend did not provide a valid total page count for this chapter.",
    );
  }

  if (validTasks.length !== tasks.length) {
    issues.push("One or more page tasks have an invalid page number.");
  }

  const missingPages = expectedPageCount
    ? Array.from({ length: expectedPageCount }, (_, index) => index + 1).filter(
        (pageNumber) =>
          !validTasks.some((task) => task.pageNumber === pageNumber),
      )
    : [];

  if (missingPages.length > 0) {
    issues.push(`Missing page tasks: ${missingPages.join(", ")}.`);
  }

  const missingAssignments = validTasks.filter(
    (task) => !task.assignedAssistantId?.trim(),
  );

  if (missingAssignments.length > 0) {
    const pages = [...new Set(missingAssignments.map((task) => task.pageNumber))];
    issues.push(
      `Assignment information is unavailable for page${pages.length === 1 ? "" : "s"} ${pages.join(", ")}.`,
    );
  }

  const incompleteTasks = validTasks.filter(
    (task) => !acceptableStatuses.has(normalizeStatus(task.status)),
  );

  if (incompleteTasks.length > 0) {
    const pages = [...new Set(incompleteTasks.map((task) => task.pageNumber))];
    issues.push(
      `Page${pages.length === 1 ? "" : "s"} ${pages.join(", ")} still contain incomplete or unapproved tasks.`,
    );
  }

  if (tasks.length === 0) {
    issues.push("No page tasks were returned for this chapter.");
  }

  return {
    isReady: issues.length === 0,
    approvedTaskCount: validTasks.length - incompleteTasks.length,
    expectedPageCount,
    missingPages,
    issues,
  };
}
