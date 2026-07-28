import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  Check,
  ClipboardCheck,
  History,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  BasePageVersionDto,
  ChapterDto,
  DeadlineExtensionRequestDto,
  MangaSeriesDto,
  PageTaskDto,
  TaskAssistantCandidatesDto,
  UpdateTaskDetailsPayload,
} from "../../shared/types/mangaErp";

type TaskAssignmentNavigationState = {
  seriesId?: string;
  chapterId?: string;
};

const recreatedTaskAssistantStoragePrefix =
  "manga-studio:recreated-task-assistant";

function getRecreatedTaskAssistantStorageKey(
  chapterId: string,
  pageNumber: number,
) {
  return `${recreatedTaskAssistantStoragePrefix}:${chapterId}:${pageNumber}`;
}

function getStoredRecreatedTaskAssistantId(
  chapterId: string,
  pageNumber: number,
) {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.sessionStorage
      .getItem(getRecreatedTaskAssistantStorageKey(chapterId, pageNumber))
      ?.trim() ?? ""
  );
}

function storeRecreatedTaskAssistantId(
  chapterId: string,
  pageNumber: number,
  assistantId: string,
) {
  if (typeof window === "undefined" || !assistantId.trim()) {
    return;
  }

  window.sessionStorage.setItem(
    getRecreatedTaskAssistantStorageKey(chapterId, pageNumber),
    assistantId.trim(),
  );
}

function clearStoredRecreatedTaskAssistantId(
  chapterId: string,
  pageNumber: number,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(
    getRecreatedTaskAssistantStorageKey(chapterId, pageNumber),
  );
}

function normalizeAssistantId(assistantId?: string | null) {
  return assistantId?.trim().toLowerCase() ?? "";
}

function formatDateTimeLocal(dateTime?: string | null) {
  if (!dateTime) {
    return "";
  }

  const value = new Date(dateTime);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  return (
    [value.getFullYear(), pad(value.getMonth() + 1), pad(value.getDate())].join(
      "-",
    ) + `T${pad(value.getHours())}:${pad(value.getMinutes())}`
  );
}

function getBaseImageUrl(
  existingPage?: PageTaskDto,
  existingTask?: PageTaskDto,
) {
  return existingTask?.baseImageUrl ?? existingPage?.baseImageUrl ?? "";
}

function formatDateTime(dateTime?: string | null) {
  if (!dateTime) {
    return "No date recorded";
  }

  const value = new Date(dateTime);

  if (Number.isNaN(value.getTime())) {
    return dateTime;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function isCancelledTask(task: PageTaskDto) {
  return ["cancelled", "canceled"].includes(task.status.toLowerCase());
}

function getTaskTimestamp(task: PageTaskDto) {
  const timestamp = Date.parse(task.updatedAt ?? task.createdAt ?? "");

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getPreviouslyAssignedAssistantId(
  tasks: PageTaskDto[],
  currentTaskId?: string,
) {
  const previousAssignedTask = [...tasks]
    .filter(
      (task) =>
        task.id !== currentTaskId && Boolean(task.assignedAssistantId?.trim()),
    )
    .sort(
      (firstTask, secondTask) =>
        getTaskTimestamp(secondTask) - getTaskTimestamp(firstTask),
    )[0];

  return previousAssignedTask?.assignedAssistantId?.trim() ?? "";
}

function hasSubmittedArtwork(task: PageTaskDto | null) {
  if (!task) {
    return false;
  }

  return Boolean(
    (task.currentLayerVersion ?? 0) > 0 ||
    task.fileUrlOriginal ||
    task.fileUrlOptimized ||
    task.previewCompositeUrl,
  );
}

function getCurrentTimestamp() {
  return Date.now();
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

type WorkQueueStatusInfo = {
  label: string;
  description: string;
  order: number;
  toneClassName: string;
};

type WorkQueueGroup = WorkQueueStatusInfo & {
  statusKey: string;
  tasks: PageTaskDto[];
};

const workQueueStatusInfoByKey: Record<string, WorkQueueStatusInfo> = {
  pending: {
    label: "Pending",
    description: "Ready to be assigned.",
    order: 1,
    toneClassName: "border-slate-600 bg-slate-800 text-slate-200",
  },
  pendingacceptance: {
    label: "Pending acceptance",
    description: "Waiting for the Primary Assistant to respond.",
    order: 2,
    toneClassName: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  },
  inprogress: {
    label: "In progress",
    description: "The Primary Assistant is working on this page.",
    order: 3,
    toneClassName: "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
  },
  incomplete: {
    label: "In progress",
    description: "The Primary Assistant is working on this page.",
    order: 3,
    toneClassName: "border-cyan-400/40 bg-cyan-400/10 text-cyan-100",
  },
  reassignmentrequired: {
    label: "Needs reassignment",
    description: "Choose another Assistant to continue the work.",
    order: 4,
    toneClassName: "border-orange-400/40 bg-orange-400/10 text-orange-100",
  },
  reviewing: {
    label: "Reviewing",
    description: "Artwork was submitted and needs your review.",
    order: 5,
    toneClassName: "border-violet-400/40 bg-violet-400/10 text-violet-100",
  },
  revisionalert: {
    label: "Revision requested",
    description: "The Assistant needs to revise the artwork.",
    order: 6,
    toneClassName: "border-rose-400/40 bg-rose-400/10 text-rose-100",
  },
  approved: {
    label: "Approved",
    description: "Artwork was accepted.",
    order: 7,
    toneClassName: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    description: "This task is no longer active.",
    order: 8,
    toneClassName: "border-slate-600 bg-slate-800 text-slate-300",
  },
  canceled: {
    label: "Cancelled",
    description: "This task is no longer active.",
    order: 8,
    toneClassName: "border-slate-600 bg-slate-800 text-slate-300",
  },
};

function normalizeWorkQueueStatus(status?: string | null) {
  return (status ?? "unknown").replace(/[\s_-]/g, "").toLowerCase();
}

function getWorkQueueStatusInfo(status?: string | null): WorkQueueStatusInfo {
  return (
    workQueueStatusInfoByKey[normalizeWorkQueueStatus(status)] ?? {
      label: status?.trim() || "Unknown",
      description: "Task status returned by the system.",
      order: 99,
      toneClassName: "border-slate-700 bg-slate-800 text-slate-200",
    }
  );
}

export default function TaskAssignmentPage() {
  const toast = useToast();
  const location = useLocation();
  const navigationState =
    location.state as TaskAssignmentNavigationState | null;
  const [seriesList, setSeriesList] = useState<MangaSeriesDto[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [chapters, setChapters] = useState<ChapterDto[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [assistantId, setAssistantId] = useState("");
  const [assistantCandidates, setAssistantCandidates] =
    useState<TaskAssistantCandidatesDto | null>(null);
  const [loadedCandidateSourceKey, setLoadedCandidateSourceKey] = useState("");
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const [taskType, setTaskType] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [originalPageFile, setOriginalPageFile] = useState<File | null>(null);
  const [originalPagePreviewUrl, setOriginalPagePreviewUrl] = useState("");
  const [baseImageUrl, setBaseImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPageData, setIsLoadingPageData] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [hasExistingBasePage, setHasExistingBasePage] = useState(false);
  const [hasExistingTask, setHasExistingTask] = useState(false);
  const [activePageTask, setActivePageTask] = useState<PageTaskDto | null>(
    null,
  );
  const [selectedPageTaskId, setSelectedPageTaskId] = useState("");
  const [basePageVersions, setBasePageVersions] = useState<
    BasePageVersionDto[]
  >([]);
  const [isBasePageHistoryOpen, setIsBasePageHistoryOpen] = useState(false);
  const [isLoadingBasePageHistory, setIsLoadingBasePageHistory] =
    useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [isCancellingTask, setIsCancellingTask] = useState(false);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
    useState(false);
  const [pageDataReloadKey, setPageDataReloadKey] = useState(0);
  const [workQueueTasks, setWorkQueueTasks] = useState<PageTaskDto[]>([]);
  const [isLoadingWorkQueue, setIsLoadingWorkQueue] = useState(false);
  const [workQueueError, setWorkQueueError] = useState("");
  const [workQueueReloadKey, setWorkQueueReloadKey] = useState(0);
  const [extensionRequests, setExtensionRequests] = useState<
    DeadlineExtensionRequestDto[]
  >([]);
  const [isLoadingExtensions, setIsLoadingExtensions] = useState(false);
  const [handlingExtensionRequestId, setHandlingExtensionRequestId] =
    useState("");
  const [extensionRejectionReasons, setExtensionRejectionReasons] = useState<
    Record<string, string>
  >({});
  const hydratedAssistantPageKeyRef = useRef("");
  const [message, setMessage] = useState("");
  const isTaskLocked = hasSubmittedArtwork(activePageTask);
  const assignedAssistantId = activePageTask?.assignedAssistantId?.trim() ?? "";
  const isTaskAwaitingAssistant =
    hasExistingTask && !assignedAssistantId && !isTaskLocked;
  const canSelectAssistant = !hasExistingTask || isTaskAwaitingAssistant;
  const taskEditAvailabilityMessage = isTaskLocked
    ? "This task is locked because the Assistant has already submitted artwork."
    : isTaskAwaitingAssistant
      ? [
          "This recreated task is waiting for an Assistant.",
          "Select an available Assistant, then save and assign it.",
        ].join(" ")
      : [
          "You can update the note, deadline, task type, and original page image",
          "before the Assistant submits artwork.",
        ].join(" ");
  const taskActionLabel = hasExistingTask
    ? isTaskLocked
      ? "Task submitted — locked"
      : isUpdatingTask
        ? "Saving task changes..."
        : isTaskAwaitingAssistant
          ? "Activate & Assign Recreated Task"
          : "Save task changes"
    : isAssigning
      ? "Assigning..."
      : "Activate & Assign Task";
  const selectedAssistantId = assistantId.trim();
  const currentTaskId = activePageTask?.id ?? selectedPageTaskId;
  const candidateSourceKey = currentTaskId
    ? `task:${currentTaskId}`
    : chapterId
      ? `chapter:${chapterId}`
      : "";
  const availableAssistants =
    loadedCandidateSourceKey === candidateSourceKey
      ? (assistantCandidates?.availableAssistants ?? [])
      : [];
  const unavailableAssistants =
    loadedCandidateSourceKey === candidateSourceKey
      ? (assistantCandidates?.unavailableAssistants ?? [])
      : [];
  const workQueueGroups = useMemo(() => {
    const groups = new Map<string, WorkQueueGroup>();

    workQueueTasks.forEach((task) => {
      const statusKey = normalizeWorkQueueStatus(task.status);
      const existingGroup = groups.get(statusKey);

      if (existingGroup) {
        existingGroup.tasks.push(task);
        return;
      }

      groups.set(statusKey, {
        statusKey,
        ...getWorkQueueStatusInfo(task.status),
        tasks: [task],
      });
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        tasks: [...group.tasks].sort(
          (firstTask, secondTask) =>
            firstTask.pageNumber - secondTask.pageNumber,
        ),
      }))
      .sort(
        (firstGroup, secondGroup) =>
          firstGroup.order - secondGroup.order ||
          firstGroup.label.localeCompare(secondGroup.label),
      );
  }, [workQueueTasks]);

  async function loadSeriesAndChapters() {
    // Khởi tạo workspace bằng series/chapter đầu tiên mà Mangaka đang sở hữu.
    setIsLoading(true);
    setMessage("");

    try {
      const seriesResult = await mangaErpApi.getMySeries();
      setSeriesList(seriesResult);

      const requestedSeriesId = navigationState?.seriesId;
      const preferredSeriesId =
        requestedSeriesId &&
        seriesResult.some((series) => series.id === requestedSeriesId)
          ? requestedSeriesId
          : selectedSeriesId || seriesResult[0]?.id || "";

      setSelectedSeriesId(preferredSeriesId);

      if (!preferredSeriesId) {
        setChapters([]);
        setChapterId("");
        setMessage("Không tìm thấy series nào trong workspace của bạn.");
        return;
      }

      const chapterResult =
        await mangaErpApi.getChaptersBySeries(preferredSeriesId);
      setChapters(chapterResult);

      const requestedChapterId = navigationState?.chapterId;
      const preferredChapterId =
        requestedChapterId &&
        chapterResult.some((chapter) => chapter.id === requestedChapterId)
          ? requestedChapterId
          : chapterResult[0]?.id || "";

      setChapterId(preferredChapterId);
    } catch (err) {
      setChapters([]);
      setChapterId("");
      const detail =
        err instanceof Error ? err.message : "Could not load chapters.";
      setMessage(detail);
      toast.error("Could not load chapter workspace", detail);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadChaptersBySeries(seriesId: string) {
    setIsLoading(true);
    setMessage("");

    try {
      const chapterResult = await mangaErpApi.getChaptersBySeries(seriesId);
      setChapters(chapterResult);
      setChapterId(chapterResult[0]?.id || "");
    } catch (err) {
      setChapters([]);
      setChapterId("");
      const detail =
        err instanceof Error ? err.message : "Could not load chapters.";
      setMessage(detail);
      toast.error("Could not load series chapters", detail);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Chỉ tải dữ liệu khởi tạo một lần khi mở màn hình.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSeriesAndChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!candidateSourceKey) {
      return undefined;
    }

    async function loadAssistantCandidates() {
      setIsLoadingCandidates(true);
      setCandidateError("");
      // Danh sách này chỉ gợi ý; Mangaka vẫn là người quyết định Assistant nhận task.
      try {
        const candidates = currentTaskId
          ? await mangaErpApi.getTaskAssistantCandidates(currentTaskId)
          : await mangaErpApi.getChapterAssistantCandidates(chapterId);

        if (!ignore) {
          setAssistantCandidates(candidates);
          setLoadedCandidateSourceKey(candidateSourceKey);
        }
      } catch (error) {
        if (!ignore) {
          setAssistantCandidates(null);
          setLoadedCandidateSourceKey(candidateSourceKey);
          setCandidateError(
            getErrorMessage(error, "Could not load available Assistants."),
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingCandidates(false);
        }
      }
    }

    void loadAssistantCandidates();

    return () => {
      ignore = true;
    };
  }, [candidateSourceKey, chapterId, currentTaskId]);

  useEffect(() => {
    let ignore = false;

    const timer = window.setTimeout(() => {
      if (!currentTaskId) {
        setExtensionRequests([]);
        setIsLoadingExtensions(false);
        return;
      }

      async function loadExtensionRequests() {
        setIsLoadingExtensions(true);

        try {
          const result =
            await mangaErpApi.getDeadlineExtensionRequests(currentTaskId);

          if (!ignore) {
            setExtensionRequests(result);
          }
        } catch (error) {
          if (!ignore) {
            setExtensionRequests([]);
            toast.error(
              "Could not load deadline extension requests",
              getErrorMessage(error, "Please try again."),
            );
          }
        } finally {
          if (!ignore) {
            setIsLoadingExtensions(false);
          }
        }
      }

      void loadExtensionRequests();
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [currentTaskId, toast]);

  useEffect(() => {
    let ignore = false;

    const timer = window.setTimeout(() => {
      if (!chapterId || !Number.isFinite(pageNumber) || pageNumber < 1) {
        hydratedAssistantPageKeyRef.current = "";
        setHasExistingBasePage(false);
        setHasExistingTask(false);
        setActivePageTask(null);
        setSelectedPageTaskId("");
        setBasePageVersions([]);
        setIsBasePageHistoryOpen(false);
        return;
      }

      async function loadExistingPageData() {
        setIsLoadingPageData(true);
        setMessage("");

        // Chapter detail carries the immutable BaseImageUrl for each page.
        // The task list provides assignment metadata only after the page is activated.
        try {
          const [chapterDetail, chapterTasks] = await Promise.all([
            mangaErpApi.getChapter(chapterId),
            mangaErpApi
              .getChapterPageTasks(chapterId)
              .catch(() => [] as PageTaskDto[]),
          ]);

          if (ignore) {
            return;
          }

          const existingPage = chapterDetail.pageTasks?.find(
            (page) => page.pageNumber === pageNumber,
          );
          // Bỏ qua task đã hủy mềm để luôn hiển thị task mới nhất đang còn hiệu lực.
          const pageTasks = chapterTasks.filter(
            (task) => task.pageNumber === pageNumber,
          );
          const existingTask =
            pageTasks.find((task) => !isCancelledTask(task)) ?? pageTasks[0];
          const taskDetail = existingTask?.id
            ? await mangaErpApi
                .getPageTask(existingTask.id)
                .catch(() => existingTask)
            : undefined;

          if (ignore) {
            return;
          }

          const taskData = taskDetail ?? existingTask ?? null;
          const pageData = taskData ?? existingPage;
          const existingImageUrl = getBaseImageUrl(
            existingPage,
            taskData ?? undefined,
          );
          const storedAssistantId = getStoredRecreatedTaskAssistantId(
            chapterId,
            pageNumber,
          );
          const assistantPageKey = getRecreatedTaskAssistantStorageKey(
            chapterId,
            pageNumber,
          );
          const isReloadingSamePage =
            hydratedAssistantPageKeyRef.current === assistantPageKey;
          const restoredAssistantId =
            taskData?.assignedAssistantId?.trim() ||
            storedAssistantId ||
            getPreviouslyAssignedAssistantId(pageTasks, taskData?.id) ||
            existingPage?.assignedAssistantId?.trim() ||
            "";

          setHasExistingBasePage(
            Boolean(existingPage || pageData?.baseImageUrl),
          );
          setHasExistingTask(Boolean(taskData));
          setActivePageTask(taskData);
          setSelectedPageTaskId(pageData?.id ?? "");
          setBasePageVersions([]);
          setIsBasePageHistoryOpen(false);
          setOriginalPageFile(null);
          setBaseImageUrl(existingImageUrl);
          setOriginalPagePreviewUrl(existingImageUrl);

          // Restore the previous page assignment when a recreated task has
          // not received its Assistant assignment yet.
          if (restoredAssistantId) {
            storeRecreatedTaskAssistantId(
              chapterId,
              pageNumber,
              restoredAssistantId,
            );
          }

          setAssistantId((currentAssistantId) => {
            if (restoredAssistantId) {
              return restoredAssistantId;
            }

            if (isReloadingSamePage && currentAssistantId.trim()) {
              return currentAssistantId;
            }

            return "";
          });
          hydratedAssistantPageKeyRef.current = assistantPageKey;
          setTaskType(pageData?.taskType ?? "Background");
          setTaskDescription(pageData?.description ?? "");
          setDeadline(formatDateTimeLocal(pageData?.deadline));
        } catch (err) {
          if (ignore) {
            return;
          }

          setHasExistingBasePage(false);
          setHasExistingTask(false);
          setActivePageTask(null);
          setSelectedPageTaskId("");
          setBasePageVersions([]);
          setIsBasePageHistoryOpen(false);
          setOriginalPageFile(null);
          setBaseImageUrl("");
          setOriginalPagePreviewUrl("");
          setAssistantId("");
          hydratedAssistantPageKeyRef.current = "";
          setTaskType("Background");
          setTaskDescription("");
          setDeadline("");

          const detail =
            err instanceof Error
              ? err.message
              : "Could not load the selected page data.";

          setMessage(detail);
        } finally {
          if (!ignore) {
            setIsLoadingPageData(false);
          }
        }
      }

      void loadExistingPageData();
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [chapterId, pageDataReloadKey, pageNumber]);

  useEffect(() => {
    let ignore = false;

    const timer = window.setTimeout(() => {
      async function loadWorkQueue() {
        if (!chapterId) {
          if (!ignore) {
            setWorkQueueTasks([]);
            setWorkQueueError("");
            setIsLoadingWorkQueue(false);
          }

          return;
        }

        setIsLoadingWorkQueue(true);
        setWorkQueueError("");

        try {
          const tasks = await mangaErpApi.getChapterPageTasks(chapterId);

          if (!ignore) {
            setWorkQueueTasks(tasks);
          }
        } catch (error) {
          if (!ignore) {
            setWorkQueueTasks([]);
            setWorkQueueError(
              getErrorMessage(error, "Could not load the task work queue."),
            );
          }
        } finally {
          if (!ignore) {
            setIsLoadingWorkQueue(false);
          }
        }
      }

      void loadWorkQueue();
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [chapterId, pageDataReloadKey, workQueueReloadKey]);

  useEffect(() => {
    if (!originalPagePreviewUrl.startsWith("blob:")) return undefined;

    return () => URL.revokeObjectURL(originalPagePreviewUrl);
  }, [originalPagePreviewUrl]);

  const validateRequiredTaskFields = (requireNewBaseImage: boolean) => {
    const missingFields: string[] = [];

    if (!chapterId) missingFields.push("chapter");
    if (!Number.isFinite(pageNumber) || pageNumber < 1) {
      missingFields.push("page number");
    }
    if (!selectedAssistantId) missingFields.push("Assistant");
    if (!deadline) missingFields.push("deadline");
    if (!taskType) missingFields.push("task type");
    if (!taskDescription.trim()) missingFields.push("task note");
    if (
      requireNewBaseImage
        ? !originalPageFile
        : !originalPageFile && !baseImageUrl && !hasExistingBasePage
    ) {
      missingFields.push("original page image");
    }

    if (missingFields.length === 0) return true;

    const detail = `Complete the following required fields: ${missingFields.join(", ")}.`;
    setMessage(detail);
    toast.error("Required information is missing", detail);
    return false;
  };

  const handleCreateBasePage = async () => {
    if (hasExistingBasePage) {
      const detail = `Page ${pageNumber} already has its original page image.`;
      setMessage(detail);
      toast.error("Base page already exists", detail);
      return;
    }

    if (!validateRequiredTaskFields(true)) return;

    if (!chapterId) {
      setMessage("Vui lòng chọn chapter trước khi tiếp tục.");
      return;
    }

    if (!originalPageFile) {
      const detail =
        "Choose the original page image before creating a base page.";
      setMessage(detail);
      toast.error("Original page image is required", detail);
      return;
    }

    setIsCreatingPage(true);
    setMessage("");

    try {
      // BaseImageUrl is immutable source material; upload it once before the page exists.
      let uploadedBaseImageUrl = baseImageUrl;

      if (!uploadedBaseImageUrl) {
        const uploadResult = await mangaErpApi.uploadImage(originalPageFile);
        uploadedBaseImageUrl = uploadResult.url;
        setBaseImageUrl(uploadedBaseImageUrl);
      }

      await mangaErpApi.addBasePage(
        chapterId,
        pageNumber,
        uploadedBaseImageUrl,
      );

      setHasExistingBasePage(true);
      setMessage("");
      toast.success(
        "Base page created",
        `Page ${pageNumber} is ready for task assignment.`,
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessage(detail);
      toast.error("Could not create base page", detail);
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleActivateTask = async () => {
    if (hasExistingTask) {
      const detail = `Page ${pageNumber} already has an assigned task.`;
      setMessage(detail);
      toast.error("Task already assigned", detail);
      return;
    }

    if (!validateRequiredTaskFields(false)) return;

    if (!chapterId) {
      setMessage("Vui lòng chọn chapter trước khi tiếp tục.");
      return;
    }

    if (!selectedAssistantId.trim()) {
      setMessage("Vui lòng nhập Assistant user ID thật.");
      return;
    }

    if (!deadline) {
      const detail = "Set a deadline before assigning this page task.";
      setMessage(detail);
      toast.error("Deadline is required", detail);
      return;
    }

    const deadlineValue = new Date(deadline);

    if (Number.isNaN(deadlineValue.getTime())) {
      const detail = "Choose a valid task deadline before assigning the task.";
      setMessage(detail);
      toast.error("Invalid deadline", detail);
      return;
    }

    if (deadlineValue.getTime() <= getCurrentTimestamp()) {
      const detail = "The task deadline must be later than the current time.";
      setMessage(detail);
      toast.error("Invalid deadline", detail);
      return;
    }

    setIsAssigning(true);
    setMessage("");

    try {
      await mangaErpApi.activatePage(chapterId, {
        PageNumber: pageNumber,
        AssignedAssistantId: selectedAssistantId.trim(),
        Description: taskDescription.trim() || null,
        Deadline: deadlineValue.toISOString(),
        TaskType: taskType,
      });

      storeRecreatedTaskAssistantId(chapterId, pageNumber, selectedAssistantId);
      setHasExistingTask(true);
      setPageDataReloadKey((value) => value + 1);
      setMessage("");
      toast.success(
        "Page task assigned",
        `Page ${pageNumber} is now in the Assistant task inbox.`,
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessage(detail);
      toast.error("Could not assign page task", detail);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleLoadBasePageHistory = async () => {
    if (!selectedPageTaskId) {
      return;
    }

    setIsBasePageHistoryOpen(true);
    setIsLoadingBasePageHistory(true);
    setMessage("");

    try {
      // Lịch sử thuộc về page task, không phải chỉ riêng chapter/page number.
      const versions =
        await mangaErpApi.getBasePageVersions(selectedPageTaskId);

      setBasePageVersions(versions);
    } catch (err) {
      const detail =
        err instanceof Error
          ? err.message
          : "Could not load base page history.";

      setMessage(detail);
      toast.error("Could not load base page history", detail);
    } finally {
      setIsLoadingBasePageHistory(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedPageTaskId) {
      const detail = "Select an existing page task before saving changes.";
      setMessage(detail);
      toast.error("Task not found", detail);
      return;
    }

    if (isTaskLocked) {
      const detail =
        "This task is locked because the Assistant has already submitted artwork.";

      setMessage(detail);
      toast.error("Task can no longer be edited", detail);
      return;
    }

    if (!validateRequiredTaskFields(false)) return;

    if (isTaskAwaitingAssistant && !selectedAssistantId) {
      const detail = "Select an Assistant before assigning the recreated task.";

      setMessage(detail);
      toast.error("Assistant is required", detail);
      return;
    }

    if (!deadline) {
      const detail = "Set a deadline before saving the task.";
      setMessage(detail);
      toast.error("Deadline is required", detail);
      return;
    }

    const deadlineValue = new Date(deadline);

    if (Number.isNaN(deadlineValue.getTime())) {
      const detail = "Choose a valid task deadline before saving the task.";
      setMessage(detail);
      toast.error("Invalid deadline", detail);
      return;
    }

    setIsUpdatingTask(true);
    setMessage("");

    try {
      let updatedBaseImageUrl = baseImageUrl;

      // Chỉ upload ảnh mới khi Mangaka thực sự thay file gốc.
      if (originalPageFile) {
        const uploadResult = await mangaErpApi.uploadImage(originalPageFile);
        updatedBaseImageUrl = uploadResult.url;
        setBaseImageUrl(updatedBaseImageUrl);
        setOriginalPagePreviewUrl(updatedBaseImageUrl);
      }

      const payload: UpdateTaskDetailsPayload = {
        Description: taskDescription.trim() || null,
        Deadline: deadlineValue.toISOString(),
        TaskType: taskType,
      };

      if (updatedBaseImageUrl) {
        payload.BaseImageUrl = updatedBaseImageUrl;
      }

      await mangaErpApi.updateTaskDetails(selectedPageTaskId, payload);

      if (isTaskAwaitingAssistant) {
        // Cancel-and-recreate creates a fresh Draft task. A Draft must be
        // activated before it can be assigned; the reassign endpoint only
        // accepts Incomplete or RevisionAlert tasks.
        await mangaErpApi.activatePage(chapterId, {
          PageNumber: pageNumber,
          AssignedAssistantId: selectedAssistantId,
          Description: taskDescription.trim() || null,
          Deadline: deadlineValue.toISOString(),
          TaskType: taskType,
        });

        storeRecreatedTaskAssistantId(
          chapterId,
          pageNumber,
          selectedAssistantId,
        );
      }

      setOriginalPageFile(null);
      setPageDataReloadKey((value) => value + 1);
      toast.success(
        isTaskAwaitingAssistant ? "Task assigned" : "Task updated",
        isTaskAwaitingAssistant
          ? "The recreated task was activated and assigned to the selected Assistant."
          : "The Assistant will receive the latest task details.",
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessage(detail);
      toast.error("Could not update task", detail);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleCancelAndRecreateTask = async () => {
    if (!selectedPageTaskId) {
      return;
    }

    const previousAssistantId = assignedAssistantId || selectedAssistantId;
    const previouslyStoredAssistantId = getStoredRecreatedTaskAssistantId(
      chapterId,
      pageNumber,
    );

    setIsCancellingTask(true);
    setMessage("");

    // Keep the old assignee before the cancelled task disappears from the
    // active task response so the recreated task can reuse that Assistant.
    storeRecreatedTaskAssistantId(chapterId, pageNumber, previousAssistantId);

    try {
      // BE hủy mềm task cũ và sinh task mới trên đúng page hiện tại.
      await mangaErpApi.cancelAndRecreateTask(selectedPageTaskId);

      setAssistantId(previousAssistantId);
      setIsCancelConfirmationOpen(false);
      setPageDataReloadKey((value) => value + 1);
      toast.success(
        "Task recreated",
        "The previous task was cancelled and a new task is ready to configure.",
      );
    } catch (err) {
      if (previouslyStoredAssistantId) {
        storeRecreatedTaskAssistantId(
          chapterId,
          pageNumber,
          previouslyStoredAssistantId,
        );
      } else {
        clearStoredRecreatedTaskAssistantId(chapterId, pageNumber);
      }

      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessage(detail);
      toast.error("Could not recreate task", detail);
    } finally {
      setIsCancellingTask(false);
    }
  };

  const handleOriginalPageFileChange = (file: File | null) => {
    setOriginalPageFile(file);

    if (file) {
      setOriginalPagePreviewUrl(URL.createObjectURL(file));
      setBaseImageUrl("");
      return;
    }

    setOriginalPagePreviewUrl(baseImageUrl);
  };

  const handleAssistantChange = (nextAssistantId: string) => {
    setAssistantId(nextAssistantId);

    if (nextAssistantId.trim()) {
      storeRecreatedTaskAssistantId(chapterId, pageNumber, nextAssistantId);
    }
  };

  const handleRefreshWorkQueue = () => {
    setWorkQueueReloadKey((currentKey) => currentKey + 1);
  };

  const handleDeadlineExtension = async (
    requestId: string,
    isApproved: boolean,
  ) => {
    const rejectionReason = extensionRejectionReasons[requestId]?.trim() ?? "";

    if (!isApproved && !rejectionReason) {
      toast.error(
        "Rejection reason is required",
        "Tell the Assistant why this deadline extension was rejected.",
      );
      return;
    }

    setHandlingExtensionRequestId(requestId);

    try {
      await mangaErpApi.handleDeadlineExtensionRequest(requestId, {
        IsApproved: isApproved,
        RejectionReason: isApproved ? null : rejectionReason,
      });

      if (currentTaskId) {
        setExtensionRequests(
          await mangaErpApi.getDeadlineExtensionRequests(currentTaskId),
        );
      }

      setExtensionRejectionReasons((current) => {
        const next = { ...current };
        delete next[requestId];
        return next;
      });
      setPageDataReloadKey((current) => current + 1);
      setWorkQueueReloadKey((current) => current + 1);
      toast.success(
        isApproved ? "Extension approved" : "Extension rejected",
        "The Assistant will see the updated request status.",
      );
    } catch (error) {
      toast.error(
        "Could not handle extension request",
        getErrorMessage(error, "Please try again."),
      );
    } finally {
      setHandlingExtensionRequestId("");
    }
  };

  const handleOpenWorkQueueTask = (task: PageTaskDto) => {
    setPageNumber(task.pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Mangaka Workflow
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">Task Assignment</h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Mangaka tạo base page rồi phân công Assistant thực hiện artwork layer.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
              <BookOpen size={20} className="text-cyan-300" />
              Select Chapter
            </h2>

            <button
              type="button"
              onClick={() => void loadSeriesAndChapters()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              Reload
            </button>
          </div>

          <div className="mt-5">
            <label className="text-sm text-slate-400">Series</label>

            <select
              value={selectedSeriesId}
              onChange={(event) => {
                const seriesId = event.target.value;
                setSelectedSeriesId(seriesId);
                void loadChaptersBySeries(seriesId);
              }}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
            >
              <option value="">Select series</option>
              {seriesList.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 space-y-4">
            {isLoading && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                Loading chapters...
              </div>
            )}

            {!isLoading && chapters.length === 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                Không có chapter nào trong series này.
              </div>
            )}

            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => setChapterId(chapter.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  chapterId === chapter.id
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-800 bg-slate-950 hover:border-cyan-400/50"
                }`}
              >
                <h3 className="font-semibold text-white">
                  Ch. {chapter.chapterNumber} - {chapter.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Total pages: {chapter.totalPages}
                </p>

                <p className="mt-1 text-sm text-cyan-300">
                  Status: {chapter.status}
                </p>

                <p className="mt-2 break-all text-xs text-slate-500">
                  ID: {chapter.id}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <ClipboardCheck size={20} className="text-cyan-300" />
            Create Page Task
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-400">Chapter</label>

              <select
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="">Select chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    Ch. {chapter.chapterNumber} - {chapter.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400">Page Number</label>

              <input
                type="number"
                min={1}
                value={pageNumber}
                onChange={(event) => setPageNumber(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Available Assistant
              </label>

              <select
                value={selectedAssistantId}
                onChange={(event) => handleAssistantChange(event.target.value)}
                disabled={
                  !canSelectAssistant ||
                  isLoadingPageData ||
                  isUpdatingTask ||
                  isCancellingTask
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="">Select an available Assistant</option>
                {selectedAssistantId &&
                !availableAssistants.some(
                  (assistant) =>
                    normalizeAssistantId(assistant.assistantId) ===
                    normalizeAssistantId(selectedAssistantId),
                ) ? (
                  <option value={selectedAssistantId}>
                    Previously assigned Assistant
                  </option>
                ) : null}
                {availableAssistants.map((assistant) => (
                  <option
                    key={assistant.assistantId}
                    value={assistant.assistantId}
                  >
                    {assistant.displayName}
                    {assistant.email ? ` (${assistant.email})` : ""}
                  </option>
                ))}
                {unavailableAssistants.length > 0 ? (
                  <optgroup label="Unavailable Assistants">
                    {unavailableAssistants.map((assistant) => (
                      <option key={assistant.assistantId} disabled>
                        {assistant.displayName}
                        {assistant.availabilityReason
                          ? ` — ${assistant.availabilityReason}`
                          : " — Unavailable for this task"}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>

              {isLoadingCandidates ? (
                <p className="mt-2 text-xs text-slate-400">
                  Loading available Assistants...
                </p>
              ) : null}

              {canSelectAssistant &&
              !isLoadingPageData &&
              !isLoadingCandidates &&
              !candidateError &&
              availableAssistants.length === 0 ? (
                <p className="mt-2 text-xs text-amber-200">
                  No Assistant is currently available for this task.{" "}
                  {unavailableAssistants.length > 0
                    ? `${unavailableAssistants.length} Assistant(s) do not meet the assignment requirements.`
                    : "The candidate API returned no Assistant records."}
                </p>
              ) : null}

              {candidateError ? (
                <p role="alert" className="mt-2 text-xs text-rose-200">
                  {candidateError}
                </p>
              ) : null}
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Assistant user ID
              </label>

              <input
                value={selectedAssistantId}
                readOnly
                aria-label="Selected Assistant user ID"
                placeholder="Select an Assistant above"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Task deadline</label>

              <input
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                disabled={isTaskLocked}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Task type</label>

              <select
                value={taskType}
                onChange={(event) => setTaskType(event.target.value)}
                disabled={isTaskLocked}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                <option value="">Select task type</option>
                <option value="General">General</option>
                <option value="Background">Background</option>
                <option value="Shading">Shading</option>
                <option value="Inking">Inking</option>
                <option value="Effect">Effect</option>
                <option value="Coloring">Coloring</option>
              </select>
            </div>
          </div>

          {currentTaskId ? (
            <section className="mt-5 rounded-xl border border-violet-300/20 bg-violet-400/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-violet-200">
                    <CalendarClock size={16} />
                    Deadline extension requests
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Approve or reject Assistant deadline extension requests for
                    this page task.
                  </p>
                </div>

                <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-bold text-violet-100">
                  {extensionRequests.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {isLoadingExtensions ? (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400">
                    Loading extension requests...
                  </div>
                ) : extensionRequests.length ? (
                  extensionRequests.map((request) => {
                    const isPending =
                      request.status.trim().toLowerCase() === "pending";
                    const isHandling =
                      handlingExtensionRequestId === request.requestId;

                    return (
                      <article
                        key={request.requestId}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {request.assistantName || "Assistant"}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Requested deadline:{" "}
                              <span className="text-cyan-100">
                                {formatDateTime(request.requestedDeadline)}
                              </span>
                            </p>
                          </div>

                          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-bold text-cyan-100">
                            {request.status}
                          </span>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                          {request.reason || "No reason provided."}
                        </p>

                        {request.rejectionReason ? (
                          <p className="mt-3 rounded-lg border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">
                            Rejected reason: {request.rejectionReason}
                          </p>
                        ) : null}

                        {isPending ? (
                          <div className="mt-4 space-y-3">
                            <textarea
                              rows={2}
                              value={
                                extensionRejectionReasons[request.requestId] ??
                                ""
                              }
                              onChange={(event) =>
                                setExtensionRejectionReasons((current) => ({
                                  ...current,
                                  [request.requestId]: event.target.value,
                                }))
                              }
                              placeholder="Reason required if rejecting..."
                              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-300"
                            />

                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeadlineExtension(
                                    request.requestId,
                                    true,
                                  )
                                }
                                disabled={isHandling}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                              >
                                <Check size={16} />
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeadlineExtension(
                                    request.requestId,
                                    false,
                                  )
                                }
                                disabled={isHandling}
                                className="inline-flex items-center gap-2 rounded-lg border border-rose-300/30 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-400/20 disabled:opacity-60"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
                    No deadline extension requests for this task.
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {/* Candidate cards were merged into the Assistant select above.
          {currentTaskId ? (
            <section className="mt-5 rounded-xl border border-slate-700 bg-slate-950/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    Assistant candidates
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Select from Assistants returned by the workload and series
                    access check for this task.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshCandidates}
                  disabled={isLoadingCandidates}
                  aria-label="Refresh Assistant candidates"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={isLoadingCandidates ? "animate-spin" : undefined}
                  />
                  Refresh candidates
                </button>
              </div>

              {isLoadingCandidates ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-xl border border-slate-800 bg-slate-900"
                    />
                  ))}
                </div>
              ) : null}

              {!isLoadingCandidates && candidateError ? (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100"
                >
                  {candidateError}
                </p>
              ) : null}

              {!isLoadingCandidates && !candidateError ? (
                <div className="mt-4 space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-200">
                      Available ({availableCandidates.length})
                    </h3>

                    {availableCandidates.length > 0 ? (
                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        {availableCandidates.map((candidate) => {
                          const isSelectedCandidate =
                            normalizeAssistantId(selectedAssistantId) ===
                            normalizeAssistantId(candidate.assistantId);

                          return (
                            <button
                              key={candidate.assistantId}
                              type="button"
                              onClick={() =>
                                handleCandidateSelection(candidate)
                              }
                              disabled={
                                !canSelectAssistant ||
                                isUpdatingTask ||
                                isCancellingTask
                              }
                              className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isSelectedCandidate
                                  ? "border-cyan-300 bg-cyan-400/10"
                                  : "border-slate-700 bg-slate-900/70 hover:border-cyan-300/60"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-white">
                                    {candidate.displayName}
                                  </p>

                                  <p className="mt-1 break-all text-xs text-slate-400">
                                    {candidate.email}
                                  </p>
                                </div>

                                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-200">
                                  Available
                                </span>
                              </div>

                              <p className="mt-3 text-sm text-slate-300">
                                {getCandidateWorkloadLabel(candidate)}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {candidate.activeTaskCount ?? 0} active task(s)
                                · {candidate.pendingAssignmentCount ?? 0}{" "}
                                pending invitation(s)
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-400">
                        No Assistant candidates are currently available for this
                        task.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-amber-200">
                      Unavailable ({unavailableCandidates.length})
                    </h3>

                    {unavailableCandidates.length > 0 ? (
                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        {unavailableCandidates.map((candidate) => (
                          <div
                            key={candidate.assistantId}
                            aria-disabled="true"
                            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 opacity-70"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-200">
                                  {candidate.displayName}
                                </p>

                                <p className="mt-1 break-all text-xs text-slate-500">
                                  {candidate.email}
                                </p>
                              </div>

                              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-200">
                                Unavailable
                              </span>
                            </div>

                            <p className="mt-3 text-sm text-slate-400">
                              {candidate.availabilityReason ??
                                candidate.availabilityCode ??
                                "This Assistant cannot receive this task right now."}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {getCandidateWorkloadLabel(candidate)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null} */}

          <div className="mt-5">
            <label className="block text-sm text-slate-400">
              Original page image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  handleOriginalPageFileChange(event.target.files?.[0] ?? null)
                }
                disabled={isTaskLocked}
                className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100"
              />
            </label>

            {originalPagePreviewUrl ? (
              <img
                src={originalPagePreviewUrl}
                alt="Original page selected for this task"
                className="mt-4 max-h-72 w-full rounded-xl border border-slate-700 object-contain"
              />
            ) : null}

            <p className="mt-3 text-xs text-slate-400">
              {isLoadingPageData
                ? "Loading saved page information..."
                : hasExistingBasePage
                  ? "This original image was previously uploaded for the selected page."
                  : "The original image remains unchanged while artwork layers are reviewed."}
            </p>
          </div>

          <label className="mt-5 block text-sm text-slate-400">
            Task note for Assistant
            <textarea
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              maxLength={2000}
              disabled={isTaskLocked}
              placeholder="Describe the work requirements, expected result, colors, or details the Assistant should follow..."
              className="mt-2 h-28 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-cyan-400"
            />
          </label>

          {message && (
            <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              {message}
            </div>
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              disabled={
                isCreatingPage ||
                isLoadingPageData ||
                hasExistingBasePage ||
                !chapterId
              }
              onClick={handleCreateBasePage}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-200 hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {isCreatingPage
                ? "Uploading & creating..."
                : hasExistingBasePage
                  ? "Base Page Created"
                  : "Upload & Create Base Page"}
            </button>

            <button
              type="button"
              disabled={
                hasExistingTask
                  ? isTaskLocked ||
                    isUpdatingTask ||
                    isLoadingPageData ||
                    (isTaskAwaitingAssistant && !selectedAssistantId) ||
                    !chapterId
                  : isAssigning || isLoadingPageData || !chapterId
              }
              onClick={hasExistingTask ? handleUpdateTask : handleActivateTask}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hasExistingTask ? <Save size={18} /> : <Send size={18} />}
              {taskActionLabel}
            </button>
          </div>

          {hasExistingTask && selectedPageTaskId ? (
            <button
              type="button"
              onClick={() => void handleLoadBasePageHistory()}
              disabled={isLoadingBasePageHistory}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-300/40 px-3 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-300/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <History size={16} />
              {isLoadingBasePageHistory
                ? "Loading base page history..."
                : "View base page history"}
            </button>
          ) : null}

          {isBasePageHistoryOpen ? (
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">
                    Base page versions
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Previous original images for this page are kept here for
                    reference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBasePageHistoryOpen(false)}
                  aria-label="Close base page history"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <X size={17} />
                </button>
              </div>

              {isLoadingBasePageHistory ? (
                <p className="mt-4 text-sm text-slate-400">
                  Loading base page versions...
                </p>
              ) : basePageVersions.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  No previous base page versions were returned for this task.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {basePageVersions.map((version, index) => (
                    <article
                      key={
                        version.id ?? `${version.version ?? "version"}-${index}`
                      }
                      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
                    >
                      {version.baseImageUrl ? (
                        <img
                          src={version.baseImageUrl}
                          alt={`Base page version ${
                            version.version ?? index + 1
                          }`}
                          className="h-40 w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-slate-500">
                          No image URL was returned for this version.
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3 p-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Version {version.version ?? index + 1}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDateTime(version.createdAt)}
                          </p>
                        </div>

                        {version.isCurrent ? (
                          <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-200">
                            Current
                          </span>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {hasExistingTask ? (
            <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
              <button
                type="button"
                onClick={() => setIsCancelConfirmationOpen(true)}
                disabled={isTaskLocked || isCancellingTask || isUpdatingTask}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-300/40 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw size={16} />
                {isCancellingTask
                  ? "Recreating task..."
                  : "Cancel & recreate task"}
              </button>

              <p className="mt-2 text-xs leading-5 text-amber-100/80">
                {taskEditAvailabilityMessage}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Mangaka · Work queue
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Task progress by status
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Track every page task in the selected chapter and open a page to
              continue working.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshWorkQueue}
            disabled={!chapterId || isLoadingWorkQueue}
            aria-label="Refresh task work queue"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isLoadingWorkQueue ? "animate-spin" : undefined}
            />
            Refresh queue
          </button>
        </div>

        {!chapterId ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-400">
            Choose a chapter to view its work queue.
          </p>
        ) : null}

        {chapterId && isLoadingWorkQueue ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-950/70"
              />
            ))}
          </div>
        ) : null}

        {chapterId && !isLoadingWorkQueue && workQueueError ? (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100"
          >
            <span>{workQueueError}</span>

            <button
              type="button"
              onClick={handleRefreshWorkQueue}
              className="rounded-lg border border-rose-300/40 px-3 py-2 font-semibold transition hover:bg-rose-400/10"
            >
              Try again
            </button>
          </div>
        ) : null}

        {chapterId &&
        !isLoadingWorkQueue &&
        !workQueueError &&
        workQueueGroups.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-400">
            No page tasks have been created for this chapter.
          </p>
        ) : null}

        {chapterId &&
        !isLoadingWorkQueue &&
        !workQueueError &&
        workQueueGroups.length > 0 ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {workQueueGroups.map((group) => (
              <article
                key={group.statusKey}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{group.label}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {group.description}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${group.toneClassName}`}
                  >
                    {group.tasks.length}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {group.tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleOpenWorkQueueTask(task)}
                      aria-label={`Open page ${task.pageNumber} in task assignment`}
                      className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300/70 ${
                        task.id === currentTaskId
                          ? "border-cyan-300/70 bg-cyan-300/10"
                          : "border-slate-800 bg-slate-950/80 hover:border-cyan-300/50 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            Page {task.pageNumber}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {task.taskType ??
                              task.currentLayerType ??
                              "Layer not specified"}
                          </p>
                        </div>

                        <span className="text-xs font-medium text-slate-300">
                          {task.status || group.label}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>
                          {task.assignedAssistantId
                            ? "Assistant assigned"
                            : "No Assistant assigned"}
                        </span>
                        <span>
                          {task.deadline
                            ? `Due ${formatDateTime(task.deadline)}`
                            : "No deadline"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {isCancelConfirmationOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="presentation"
          onMouseDown={() => {
            if (!isCancellingTask) {
              setIsCancelConfirmationOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-task-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <h2
              id="cancel-task-dialog-title"
              className="text-xl font-bold text-white"
            >
              Cancel and recreate this task?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              The current task will be soft-cancelled and a new task will be
              created for this same page. Use this only when you need a clean
              task for a different layer or requirement.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCancelConfirmationOpen(false)}
                disabled={isCancellingTask}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              >
                Keep current task
              </button>

              <button
                type="button"
                onClick={() => void handleCancelAndRecreateTask()}
                disabled={isCancellingTask}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                <RotateCcw size={16} />
                {isCancellingTask ? "Recreating..." : "Cancel & recreate"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
