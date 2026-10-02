"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Search,
  UsersRound,
} from "lucide-react";
import { useGetAllAthletesQuery } from "@/app/redux/api/athleteApi";

const PAGE_SIZE = 20;
const EMPTY_PROFILES = [];

export default function AthletesPage() {
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);
  const search = query.trim();
  const {
    currentData: data,
    error,
    isError,
    isLoading,
    isFetching,
  } = useGetAllAthletesQuery({
    page,
    limit: PAGE_SIZE,
    search,
  });
  const athleteProfiles = data?.athletes ?? EMPTY_PROFILES;
  const loading = isLoading || isFetching;

  const athletes = useMemo(
    () =>
      athleteProfiles.map((athlete) => ({
        id: athlete._id,
        name:
          athlete.name?.trim() ||
          athlete.userId?.name?.trim() ||
          athlete.userId?.email ||
          athlete.email ||
          "Athlete",
        email: athlete.email || athlete.userId?.email || "",
        createdAt: athlete.createdAt,
      })),
    [athleteProfiles]
  );

  const rows = useMemo(
    () =>
      [...athletes].sort((a, b) => {
        const diff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return newestFirst ? -diff : diff;
      }),
    [athletes, newestFirst],
  );

  const totalAthletes = data?.total ?? athleteProfiles.length;
  const pageCount =
    data?.pagination?.totalPages ??
    Math.max(1, Math.ceil(totalAthletes / PAGE_SIZE));
  const currentPage = data?.pagination?.currentPage ?? page;
  const start = (currentPage - 1) * PAGE_SIZE;
  const errorMessage = getErrorMessage(error);

  return (
    <div className="space-y-7 pb-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7ddc5a]">
            Community
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Athletes
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#a3acba]">
            Browse and manage the athletes building their presence on SCAH.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#7ddc5a]/10 text-[#7ddc5a]">
            <UsersRound size={19} />
          </span>
          <span>
            <span className="block text-2xl font-bold leading-none text-white">
              {loading ? "…" : isError ? "—" : totalAthletes}
            </span>
            <span className="mt-1 block text-xs text-[#a3acba]">
              Total athletes
            </span>
          </span>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11151b] shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-bold text-white">Athlete directory</h2>
            <p className="mt-1 text-xs text-[#8e98a7]">
              Search profiles and sort by registration date.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a1]"
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name or email"
                aria-label="Search athletes by name or email"
                className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#0b0e12] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-[#76808e] focus:border-[#7ddc5a]/60 focus:ring-2 focus:ring-[#7ddc5a]/10"
              />
            </label>

            <button
              type="button"
              onClick={() => setNewestFirst((value) => !value)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-3 text-sm font-semibold text-[#c3cad4] transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowDownUp size={15} className="text-[#7ddc5a]" />
              {newestFirst ? "Newest first" : "Oldest first"}
            </button>
          </div>
        </div>

        {!loading && !isError && (
          <div className="flex items-center justify-between px-5 py-3 text-xs text-[#8e98a7]">
            <span>
              {query.trim()
                ? `${totalAthletes} matching ${
                    totalAthletes === 1 ? "athlete" : "athletes"
                  }`
                : `${totalAthletes} ${
                    totalAthletes === 1 ? "athlete" : "athletes"
                  }`}
            </span>
            {totalAthletes > 0 && (
              <span className="hidden sm:inline">
                Updated directory · {newestFirst ? "Latest registrations" : "Earliest registrations"}
              </span>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-y border-white/[0.06] bg-white/[0.025] text-[11px] font-bold uppercase tracking-[0.12em] text-[#8290a0]">
                <th className="px-5 py-3.5">Athlete</th>
                <th className="px-5 py-3.5">Email address</th>
                <th className="px-5 py-3.5">Registration date</th>
              </tr>
            </thead>

            {!loading && !isError && rows.length > 0 && (
              <tbody className="divide-y divide-white/[0.055]">
                {rows.map((athlete) => (
                  <tr
                    key={athlete.id}
                    className="group transition-colors hover:bg-white/[0.035]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#7ddc5a]/20 bg-[#7ddc5a]/[0.08] text-xs font-bold tracking-wide text-[#a5ed8c]">
                          {getInitials(athlete.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-[#f4f6f8] transition group-hover:text-[#a5ed8c]">
                            {athlete.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-[#7f8a99]">
                            Athlete profile
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[300px] truncate px-5 py-4 text-sm text-[#aab3bf]">
                      {athlete.email || "Email not provided"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#aab3bf]">
                      {formatDate(athlete.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {loading && <LoadingState />}
          {!loading && isError && (
            <StateMessage
              title="We couldn’t load the athlete directory"
              description={errorMessage}
              error
            />
          )}
          {!loading && !isError && rows.length === 0 && (
            <StateMessage
              title={totalAthletes === 0 ? "No athletes yet" : "No results found"}
              description={
                totalAthletes === 0
                  ? "Athlete profiles will appear here once they join the community."
                  : "Try a different name or email address."
              }
            />
          )}
        </div>

        {!loading && !isError && pageCount > 1 && (
          <footer className="flex flex-col gap-3 border-t border-white/[0.07] px-5 py-4 text-sm text-[#a3acba] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {start + 1}–
              {Math.min(start + rows.length, totalAthletes)} of {totalAthletes}
            </span>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.09] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="min-w-24 text-center text-xs font-semibold text-[#d0d5dc]">
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                aria-label="Next page"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.09] transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  if (error && typeof error === "object" && "data" in error) {
    const data = error.data;
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Could not load athletes. Please try again.";
}

function LoadingState() {
  return (
    <div className="space-y-4 px-5 py-5" aria-label="Loading athletes">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4">
          <span className="h-10 w-10 rounded-full bg-white/[0.07]" />
          <span className="h-3 w-1/4 rounded bg-white/[0.07]" />
          <span className="ml-auto h-3 w-1/3 rounded bg-white/[0.05]" />
          <span className="hidden h-3 w-24 rounded bg-white/[0.05] sm:block" />
        </div>
      ))}
    </div>
  );
}

function StateMessage({ title, description, error }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
      <span
        className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${
          error
            ? "bg-[#ff5a3c]/10 text-[#ff806b]"
            : "bg-[#7ddc5a]/10 text-[#a5ed8c]"
        }`}
      >
        {error ? <span className="text-lg font-bold">!</span> : <UsersRound size={20} />}
      </span>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#8e98a7]">
        {description}
      </p>
    </div>
  );
}
