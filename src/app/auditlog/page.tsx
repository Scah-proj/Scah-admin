"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  FileClock,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  useGetAuditLogsQuery,
} from "@/app/redux/api/auditLogApi";

type AuditLogMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "SOCKET"
  | "OTHER";

type AuditLog = {
  _id: string;
  actorId: string | null;
  actorName?: string | null;
  actorEmail: string | null;
  targetId: string | null;
  targetType?: string | null;
  action: string;
  details?: string | null;
  outcome?: string | null;
  method: AuditLogMethod;
  path: string;
  source: "http" | "socket";
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

const PAGE_SIZE = 20;
const METHODS: AuditLogMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "SOCKET",
  "OTHER",
];

export default function AuditLogPage() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<AuditLogMethod | "">("");
  const [statusCode, setStatusCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);

  const parsedStatusCode = statusCode ? Number(statusCode) : undefined;
  const statusCodeIsValid =
    parsedStatusCode === undefined ||
    (Number.isInteger(parsedStatusCode) &&
      parsedStatusCode >= 100 &&
      parsedStatusCode <= 599);

  const {
    currentData,
    error,
    isError,
    isFetching,
    isLoading,
  } = useGetAuditLogsQuery({
    page,
    limit: PAGE_SIZE,
    action: query.trim() || undefined,
    method: method || undefined,
    statusCode: statusCodeIsValid ? parsedStatusCode : undefined,
    from: from || undefined,
    to: to || undefined,
  }, {
    skip: !statusCodeIsValid,
  });

  const logs = useMemo(
    () =>
      [...(currentData?.logs ?? [])].sort((first, second) => {
        const difference =
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime();
        return newestFirst ? -difference : difference;
      }),
    [currentData?.logs, newestFirst],
  );
  const pagination = currentData?.pagination;
  const totalResults = pagination?.totalResults ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const successCount = logs.filter(
    (log) =>
      log.outcome?.toLowerCase() === "success" ||
      (!log.outcome &&
        log.statusCode !== null &&
        log.statusCode >= 200 &&
        log.statusCode < 300),
  ).length;
  const failureCount = logs.filter(
    (log) =>
      (log.outcome && log.outcome.toLowerCase() !== "success") ||
      (!log.outcome && log.statusCode !== null && log.statusCode >= 400),
  ).length;
  const requestError = isError ? getErrorMessage(error) : null;

  const updateFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  const exportCsv = () => {
    if (logs.length === 0) return;

    const columns = [
      "Date",
      "Actor ID",
      "Actor name",
      "Actor email",
      "Action",
      "Details",
      "Outcome",
      "Method",
      "Path",
      "Source",
      "Status code",
      "Target ID",
      "Target type",
      "IP address",
      "User agent",
    ];
    const rows = logs.map((log) => [
      log.createdAt,
      log.actorId ?? "",
      log.actorName ?? "",
      log.actorEmail ?? "",
      log.action,
      log.details ?? "",
      log.outcome ?? "",
      log.method,
      log.path,
      log.source,
      log.statusCode?.toString() ?? "",
      log.targetId ?? "",
      log.targetType ?? "",
      log.ip ?? "",
      log.userAgent ?? "",
    ]);
    const csv = [columns, ...rows]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `audit-log-page-${page}.csv`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7ddc5a]">
            Security
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Activity history
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#a3acba]">
            Review and export administrative activity and security events.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={logs.length === 0 || isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-semibold text-[#e5e9ef] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <Download size={16} />
          Export this page
        </button>
      </header>

      <section
        aria-label="Audit event summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <SummaryCard
          icon={<FileClock size={18} />}
          label="Matching events"
          value={isLoading ? "…" : requestError ? "—" : totalResults}
          color="text-[#b8c5d9]"
        />
        <SummaryCard
          icon={<ShieldCheck size={18} />}
          label="2xx responses on this page"
          value={isLoading ? "…" : requestError ? "—" : successCount}
          color="text-[#7ddc5a]"
        />
        <SummaryCard
          icon={<ShieldAlert size={18} />}
          label="4xx+ responses on this page"
          value={isLoading ? "…" : requestError ? "—" : failureCount}
          color="text-[#ff927f]"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11151b] shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:px-5 sm:py-4">
          <div>
            <h2 className="text-base font-bold text-white">Audit events</h2>
            <p className="mt-1 text-xs text-[#8e98a7]">
              {isLoading
                ? "Loading audit events…"
                : requestError
                  ? "Unable to load events"
                  : `${logs.length} events on this page · ${totalResults} matching`}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_135px_145px_155px_155px_auto]">
            <label className="relative block">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a1]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => updateFilter(() => setQuery(event.target.value))}
                placeholder="Search action"
                aria-label="Search audit log actions"
                className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#0b0e12] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-[#76808e] focus:border-[#7ddc5a]/60 focus:ring-2 focus:ring-[#7ddc5a]/10"
              />
            </label>

            <label className="sr-only" htmlFor="audit-method">
              Filter by method
            </label>
            <select
              id="audit-method"
              value={method}
              onChange={(event) =>
                updateFilter(() =>
                  setMethod(
                    METHODS.find((item) => item === event.target.value) ?? "",
                  ),
                )
              }
              className="h-10 rounded-xl border border-white/[0.09] bg-[#0b0e12] px-3 text-sm text-[#d0d5dc] outline-none focus:border-[#7ddc5a]/60"
            >
              <option value="">All methods</option>
              {METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="audit-status">
              Filter by HTTP status code
            </label>
            <input
              id="audit-status"
              type="number"
              min="100"
              max="599"
              step="1"
              value={statusCode}
              onChange={(event) => updateFilter(() => setStatusCode(event.target.value))}
              placeholder="Status code"
              className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#0b0e12] px-3 text-sm text-[#d0d5dc] outline-none placeholder:text-[#76808e] focus:border-[#7ddc5a]/60"
              aria-invalid={!statusCodeIsValid}
            />

            <label className="sr-only" htmlFor="audit-from">
              From date
            </label>
            <input
              id="audit-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => updateFilter(() => setFrom(event.target.value))}
              aria-label="From date"
              className="h-10 min-w-0 rounded-xl border border-white/[0.09] bg-[#0b0e12] px-3 text-sm text-[#d0d5dc] outline-none focus:border-[#7ddc5a]/60"
            />

            <label className="sr-only" htmlFor="audit-to">
              To date
            </label>
            <input
              id="audit-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => updateFilter(() => setTo(event.target.value))}
              aria-label="To date"
              className="h-10 min-w-0 rounded-xl border border-white/[0.09] bg-[#0b0e12] px-3 text-sm text-[#d0d5dc] outline-none focus:border-[#7ddc5a]/60"
            />

            <button
              type="button"
              onClick={() => setNewestFirst((current) => !current)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-[#0b0e12] px-3 text-sm font-medium text-[#c3cad4] transition hover:bg-white/[0.05]"
              aria-label={`Sort this page by date, ${newestFirst ? "newest" : "oldest"} first`}
            >
              {newestFirst ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
              {newestFirst ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>

        {!statusCodeIsValid ? (
          <p role="alert" className="px-5 py-12 text-center text-sm text-[#ff927f]">
            Enter a whole HTTP status code between 100 and 599.
          </p>
        ) : requestError ? (
          <div role="alert" className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#ff927f]">
              Could not load audit events
            </p>
            <p className="mt-2 text-sm text-[#a3acba]">{requestError}</p>
          </div>
        ) : isLoading ? (
          <div role="status" className="px-5 py-12 text-center text-sm text-[#a3acba]">
            Loading audit events…
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] font-bold uppercase tracking-[0.12em] text-[#778291]">
                    <th scope="col" className="px-5 py-3.5">Actor</th>
                    <th scope="col" className="px-5 py-3.5">Action</th>
                    <th scope="col" className="px-5 py-3.5">Request</th>
                    <th scope="col" className="px-5 py-3.5">Target</th>
                    <th scope="col" className="px-5 py-3.5">IP address</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Date and time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.055]">
                  {logs.map((log) => (
                    <AuditLogRow key={log._id} log={log} />
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <p className="text-sm font-semibold text-[#d3d9e2]">
                          No matching events
                        </p>
                        <p className="mt-1 text-xs text-[#8792a1]">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#8792a1]">
                Page {pagination?.currentPage ?? page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || isFetching}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.09] px-3 text-sm font-medium text-[#c3cad4] transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || isFetching}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.09] px-3 text-sm font-medium text-[#c3cad4] transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function AuditLogRow({ log }: { log: AuditLog }) {
  const isSuccess = log.statusCode !== null && log.statusCode >= 200 && log.statusCode < 300;
  const isFailure = log.statusCode !== null && log.statusCode >= 400;
  const statusDescription =
    log.statusCode === null
      ? ""
      : log.statusCode < 200
        ? "Informational"
        : log.statusCode < 300
          ? "Success"
          : log.statusCode < 400
            ? "Redirect"
            : "Error";
  const outcome = log.outcome?.trim();
  const outcomeIsSuccess = outcome
    ? outcome.toLowerCase() === "success"
    : isSuccess;
  const outcomeIsFailure = outcome
    ? !outcomeIsSuccess
    : isFailure;

  return (
    <tr className="transition-colors hover:bg-white/[0.025]">
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[#e7ebf0]">
          {log.actorName || log.actorEmail || "Unknown actor"}
        </p>
        <p className="mt-1 text-xs text-[#8792a1]">
          {log.actorEmail || log.actorId || "No actor details"}
        </p>
      </td>
      <td className="max-w-[250px] px-5 py-4">
        <p className="break-words text-sm font-medium text-[#d3d9e2]">{log.action}</p>
        {log.details && (
          <p className="mt-1 max-w-[240px] break-words text-xs text-[#8792a1]">
            {log.details}
          </p>
        )}
      </td>
      <td className="max-w-[280px] px-5 py-4">
        <p className="font-mono text-xs font-semibold text-[#c3cad4]">{log.method}</p>
        <p className="mt-1 break-all font-mono text-xs text-[#8792a1]">{log.path}</p>
      </td>
      <td className="max-w-[180px] px-5 py-4">
        <p className="text-xs font-medium capitalize text-[#c3cad4]">
          {log.targetType || "—"}
        </p>
        <p className="mt-1 break-all font-mono text-xs text-[#8792a1]">
          {log.targetId || "—"}
        </p>
      </td>
      <td className="px-5 py-4 font-mono text-xs text-[#a3acba]">
        {log.ip || "—"}
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            outcomeIsSuccess
              ? "bg-[#7ddc5a]/[0.09] text-[#9be781]"
              : outcomeIsFailure
                ? "bg-[#ff5a3c]/[0.1] text-[#ff927f]"
                : "bg-white/[0.06] text-[#a3acba]"
          }`}
        >
          {outcome || log.statusCode || "—"}
          {outcome && log.statusCode !== null && (
            <span className="text-[10px] font-medium opacity-75">
              {log.statusCode}
            </span>
          )}
          {!outcome && log.statusCode !== null && (
            <span className="text-[10px] font-medium opacity-75">
              {statusDescription}
            </span>
          )}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-[#a3acba]">
        {new Date(log.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </td>
    </tr>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#11151b] px-4 py-4">
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] ${color}`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-xl font-bold leading-none text-white">
          {value}
        </span>
        <span className="mt-1.5 block text-xs text-[#a3acba]">{label}</span>
      </span>
    </div>
  );
}

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unexpected error occurred while loading the audit log.";
  }

  const apiError = error as {
    status?: number | string;
    error?: string;
    message?: string;
    data?: { message?: string; error?: { message?: string } | string };
  };

  if (typeof apiError.message === "string" && apiError.message !== "Rejected") {
    return apiError.message;
  }
  if (typeof apiError.data?.message === "string") {
    return apiError.data.message;
  }
  if (typeof apiError.data?.error === "string") {
    return apiError.data.error;
  }
  if (
    apiError.data?.error &&
    typeof apiError.data.error === "object" &&
    typeof apiError.data.error.message === "string"
  ) {
    return apiError.data.error.message;
  }
  if (apiError.status === 403) {
    return "Only platform administrators can view audit logs.";
  }
  if (apiError.status === 401) {
    return "Your session has expired. Sign in again to continue.";
  }
  return (
    apiError.error ||
    "An unexpected error occurred while loading the audit log."
  );
}
