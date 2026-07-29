import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Database, FileText, RefreshCw, Users } from "lucide-react";
import { useToast } from "../../shared/components/toastContext";
import { mangaErpApi } from "../../shared/services/mangaErpService";
import type {
  AdminDashboardDto,
  AdminDashboardFilters,
} from "../../shared/types/mangaErp";

type FilterMode = "range" | "month" | "year";

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const today = () => toIsoDate(new Date());
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
};
const formatMonthYear = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(2026, index, 1),
  ),
}));
const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day || 1);
};
const formatDateLabel = (value: string) => {
  if (!value) return "";
  const date = parseIsoDate(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export default function AdminDashboardPage() {
  const toast = useToast();
  const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedFilters, setAppliedFilters] =
    useState<AdminDashboardFilters>({});
  const [filterMode, setFilterMode] = useState<FilterMode>("range");
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(today());
  const [monthValue, setMonthValue] = useState(today().slice(0, 7));
  const [yearValue, setYearValue] = useState(String(new Date().getFullYear()));

  const activeFilter = useMemo(() => {
    if (filterMode === "month") {
      const [year, month] = monthValue.split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      return {
        filters: {
          startDate: `${monthValue}-01`,
          endDate: `${monthValue}-${String(lastDay).padStart(2, "0")}`,
        },
        groupBy: "day" as const,
        label: formatMonthYear(monthValue),
      };
    }

    if (filterMode === "year") {
      return {
        filters: {
          startDate: `${yearValue}-01-01`,
          endDate: `${yearValue}-12-31`,
        },
        groupBy: "month" as const,
        label: `Year ${yearValue}`,
      };
    }

    const start = startDate || daysAgo(30);
    const end = endDate || today();
    return {
      filters: { startDate: start, endDate: end },
      groupBy: "day" as const,
      label: `${start} to ${end}`,
    };
  }, [endDate, filterMode, monthValue, startDate, yearValue]);

  const loadDashboard = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      setDashboard(await mangaErpApi.getAdminDashboard(appliedFilters));
    } catch (error) {
      toast.error(
        "Could not load admin dashboard",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyDashboardFilter = async () => {
    setIsLoading(true);
    try {
      setDashboard(await mangaErpApi.getAdminDashboard(activeFilter.filters));
      setAppliedFilters(activeFilter.filters);
    } catch (error) {
      toast.error(
        "Could not load admin dashboard",
        error instanceof Error ? error.message : "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialDashboard() {
      try {
        const dashboardResult = await mangaErpApi.getAdminDashboard();
        if (!ignore) {
          setDashboard(dashboardResult);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(
            "Could not load admin dashboard",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void loadInitialDashboard();
    return () => {
      ignore = true;
    };
    // Initial backend load only. Filter changes apply when the user presses Apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userStats = dashboard?.userStats;
  const submissionStats = dashboard?.submissionStats;
  const seriesStats = dashboard?.seriesStats;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Admin
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">
            Admin dashboard
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Cross-module overview of platform activity and operational status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={isLoading}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {isLoading ? (
        <p className="rounded-lg border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
          Loading dashboard...
        </p>
      ) : null}

      {dashboard ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={Users}
              label="Total users"
              value={userStats?.totalUsers ?? 0}
              detail={`${userStats?.activeUsers ?? 0} active`}
            />
            <Metric
              icon={Users}
              label="Pending activation"
              value={userStats?.pendingActivation ?? 0}
              detail={`${userStats?.suspendedUsers ?? 0} suspended`}
            />
            <Metric
              icon={FileText}
              label="Submissions"
              value={submissionStats?.totalSubmissions ?? 0}
              detail={`${submissionStats?.pendingEBReview ?? 0} pending EB`}
            />
            <Metric
              icon={Database}
              label="Series"
              value={seriesStats?.totalSeries ?? 0}
              detail={`${seriesStats?.active ?? 0} active`}
            />
          </section>

          <FilterBar
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            monthValue={monthValue}
            setMonthValue={setMonthValue}
            yearValue={yearValue}
            setYearValue={setYearValue}
            activeLabel={activeFilter.label}
            isLoading={isLoading}
            onApply={() => void applyDashboardFilter()}
          />

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Operations
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  Workflow overview
                </h3>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                {activeFilter.label}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <CountBreakdown
                title="Users by role"
                total={userStats?.totalUsers ?? 0}
                items={[
                  ["Admins", userStats?.totalAdmins ?? 0],
                  ["Mangaka", userStats?.totalMangaka ?? 0],
                  ["Assistants", userStats?.totalAssistants ?? 0],
                  ["Tantou Editors", userStats?.totalTantouEditors ?? 0],
                  ["Editorial Board", userStats?.totalEditorialBoard ?? 0],
                  ["Editor-in-Chief", userStats?.totalEditorInChief ?? 0],
                ]}
              />
              <DonutBreakdown
                title="Submission workflow"
                items={[
                  ["Draft", submissionStats?.draft ?? 0, "#38bdf8"],
                  [
                    "Pending EB Review",
                    submissionStats?.pendingEBReview ?? 0,
                    "#a78bfa",
                  ],
                  [
                    "Conflict Escalated",
                    submissionStats?.conflictEscalated ?? 0,
                    "#fb7185",
                  ],
                  ["EB Approved", submissionStats?.ebApproved ?? 0, "#34d399"],
                  ["EB Rejected", submissionStats?.ebRejected ?? 0, "#f59e0b"],
                ]}
              />
              <DonutBreakdown
                title="Series lifecycle"
                items={[
                  ["Active", seriesStats?.active ?? 0, "#34d399"],
                  ["Hiatus", seriesStats?.hiatus ?? 0, "#f59e0b"],
                  ["Cancelled", seriesStats?.cancelled ?? 0, "#fb7185"],
                  [
                    "Pending cancellation",
                    seriesStats?.pendingCancellationRequests ?? 0,
                    "#a78bfa",
                  ],
                  ]}
                />
            </div>
          </section>

        </>
      ) : null}
    </div>
  );
}

function FilterBar({
  filterMode,
  setFilterMode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  monthValue,
  setMonthValue,
  yearValue,
  setYearValue,
  activeLabel,
  isLoading,
  onApply,
}: {
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  monthValue: string;
  setMonthValue: (value: string) => void;
  yearValue: string;
  setYearValue: (value: string) => void;
  activeLabel: string;
  isLoading: boolean;
  onApply: () => void;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900/75 p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="min-w-44">
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <CalendarDays size={16} className="text-cyan-200" />
            Dashboard filters
          </p>
          <p className="mt-1 text-xs text-slate-500">{activeLabel}</p>
        </div>

        <div className="flex rounded-lg border border-white/10 bg-slate-950 p-1">
          {(["range", "month", "year"] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterMode(mode)}
              className={`rounded-md px-3 py-2 text-xs font-bold capitalize transition ${
                filterMode === mode
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {filterMode === "range" ? (
          <div className="grid flex-1 gap-2 md:grid-cols-2">
            <DatePickerInput
              value={startDate}
              onChange={setStartDate}
              label="Start date"
            />
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              label="End date"
            />
          </div>
        ) : null}

        {filterMode === "month" ? (
          <div className="grid flex-1 gap-2 md:grid-cols-[1fr_8rem]">
            <select
              className="input"
              value={monthValue.slice(5, 7)}
              onChange={(event) =>
                setMonthValue(`${monthValue.slice(0, 4)}-${event.target.value}`)
              }
              aria-label="Month"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              min="2020"
              max="2100"
              value={monthValue.slice(0, 4)}
              onChange={(event) =>
                setMonthValue(`${event.target.value}-${monthValue.slice(5, 7)}`)
              }
              aria-label="Month year"
            />
          </div>
        ) : null}

        {filterMode === "year" ? (
          <input
            className="input flex-1"
            type="number"
            min="2020"
            max="2100"
            value={yearValue}
            onChange={(event) => setYearValue(event.target.value)}
            aria-label="Year"
          />
        ) : null}

        <button
          type="button"
          onClick={onApply}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Apply
        </button>
      </div>
    </section>
  );
}

function DatePickerInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseIsoDate(value || today()));
  const selectedDate = parseIsoDate(value || today());
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const previousMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayIndex = index - startOffset + 1;
    if (dayIndex < 1) {
      return {
        day: previousMonthDays + dayIndex,
        date: new Date(viewYear, viewMonth - 1, previousMonthDays + dayIndex),
        outside: true,
      };
    }
    if (dayIndex > daysInMonth) {
      return {
        day: dayIndex - daysInMonth,
        date: new Date(viewYear, viewMonth + 1, dayIndex - daysInMonth),
        outside: true,
      };
    }
    return {
      day: dayIndex,
      date: new Date(viewYear, viewMonth, dayIndex),
      outside: false,
    };
  });

  const moveMonth = (offset: number) => {
    setViewDate(new Date(viewYear, viewMonth + offset, 1));
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="input flex w-full items-center justify-between text-left"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={label}
      >
        <span>{formatDateLabel(value)}</span>
        <CalendarDays size={16} className="text-slate-400" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-80 rounded-lg border border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-bold text-white">
              {new Intl.DateTimeFormat("en-US", {
                month: "long",
                year: "numeric",
              }).format(viewDate)}
            </p>
            <button
              type="button"
              className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const iso = toIsoDate(cell.date);
              const isSelected = iso === toIsoDate(selectedDate);
              return (
                <button
                  key={iso}
                  type="button"
                  className={`grid h-9 place-items-center rounded-md text-sm transition ${
                    isSelected
                      ? "bg-cyan-500 text-white ring-2 ring-cyan-300"
                      : cell.outside
                        ? "text-slate-600 hover:bg-white/5"
                        : "text-slate-100 hover:bg-white/10"
                  }`}
                  onClick={() => {
                    onChange(iso);
                    setViewDate(cell.date);
                    setIsOpen(false);
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}

function CountBreakdown({
  title,
  total,
  items,
}: {
  title: string;
  total: number;
  items: Array<[string, number]>;
}) {
  return (
    <section className="min-h-[25rem] rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            People
          </p>
          <h3 className="mt-1 font-bold text-white">{title}</h3>
        </div>
        <div className="rounded-lg bg-cyan-300/10 px-3 py-2 text-right">
          <p className="text-xl font-black text-cyan-100">{total}</p>
          <p className="text-[11px] font-semibold uppercase text-slate-500">
            Total
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        {items.map(([label, count]) => (
          <div
            key={label}
            className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-slate-950 px-3 py-2 text-sm"
          >
            <span className="text-slate-300">{label}</span>
            <span className="font-bold text-cyan-100">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DonutBreakdown({
  title,
  items,
}: {
  title: string;
  items: Array<[string, number, string]>;
}) {
  const total = items.reduce((sum, [, count]) => sum + count, 0);
  const visibleSegments = items.filter(([, count]) => count > 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="min-h-[25rem] rounded-lg border border-white/10 bg-slate-900/75 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-white">{title}</h3>
        <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm font-black text-cyan-100">
          {total}
        </span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[11rem_1fr] md:items-center lg:grid-cols-1 2xl:grid-cols-[11rem_1fr]">
        <div className="relative mx-auto h-44 w-44 lg:h-48 lg:w-48 2xl:h-44 2xl:w-44">
          <svg
            viewBox="0 0 120 120"
            role="img"
            aria-label={`${title} donut chart`}
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
            />
            {total > 0
              ? visibleSegments.map(([label, count, color]) => {
                  const length = (count / total) * circumference;
                  const segment = (
                    <circle
                      key={label}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke={color}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.max(length - 2, 0)} ${circumference}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  offset += length;
                  return segment;
                })
              : null}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-4xl font-black text-white">{total}</p>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Total
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {items.map(([label, count, color]) => {
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={label}
                className="grid min-h-11 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-slate-950 px-3 py-2 text-sm"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 text-slate-300">{label}</span>
                <span className="font-bold text-cyan-100">
                  {count}
                  <span className="ml-2 text-xs font-semibold text-slate-500">
                    {percent}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
