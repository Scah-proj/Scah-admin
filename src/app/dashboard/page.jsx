"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  FileText,
  Search,
  UsersRound,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetAllAthletesQuery } from "../redux/api/athleteApi";
import { useGetAllScoutsQuery } from "../redux/api/scoutApi";
import { useGetUserStatsQuery } from "../redux/api/userStatsApi";
import { useGetAdminAnalyticsQuery } from "../redux/api/adminAnalyticsApi";

const SCOUT_COLOR = "#f26b3a";
const ATHLETE_COLOR = "#7ddc5a";
const EMPTY_PROFILES = [];

const card =
  "rounded-2xl border border-white/[0.08] bg-[#11151b] shadow-[0_20px_60px_rgba(0,0,0,0.16)]";

export default function OverviewPage() {
  const {
    data: athleteResponse,
    error: athleteError,
    isError: isAthleteError,
    isLoading: isAthleteLoading,
  } = useGetAllAthletesQuery({ page: 1, limit: 5 });
  const {
    data: scoutResponse,
    error: scoutError,
    isError: isScoutError,
    isLoading: isScoutLoading,
  } = useGetAllScoutsQuery({ page: 1, limit: 5 });
  const {
    currentData: userStats,
    error: statsError,
    isError: isStatsError,
    isLoading: isStatsLoading,
  } = useGetUserStatsQuery();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [newestFirst, setNewestFirst] = useState(true);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const {
    currentData: analytics,
    error: analyticsError,
    isError: isAnalyticsError,
    isFetching: isAnalyticsFetching,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useGetAdminAnalyticsQuery(analyticsDays);

  const scoutProfiles = scoutResponse?.scouts ?? EMPTY_PROFILES;
  const scouts = scoutResponse?.total ?? scoutProfiles.length;
  const athleteProfiles = athleteResponse?.athletes ?? EMPTY_PROFILES;
  const athletes = athleteResponse?.total ?? athleteProfiles.length;
  const total = scouts + athletes;
  const loading = isScoutLoading || isAthleteLoading;
  const error =
    (isScoutError && getErrorMessage(scoutError)) ||
    (isAthleteError && getErrorMessage(athleteError));
  const pct = (count) => (total ? Math.round((count / total) * 100) : 0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scoutRows = scoutProfiles.map((scout) => ({
      id: scout._id,
      name:
        scout.name?.trim() ||
        [scout.userId?.firstName, scout.userId?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        scout.userId?.name?.trim() ||
        scout.userId?.email ||
        scout.contactEmail ||
        "",
      email: scout.contactEmail || scout.email || scout.userId?.email || "",
      role: "scout",
      createdAt: scout.createdAt,
    }));
    const athleteRows = athleteProfiles.map((athlete) => ({
      id: athlete._id,
      name:
        athlete.name?.trim() ||
        athlete.userId?.name?.trim() ||
        athlete.userId?.email ||
        athlete.email ||
        "",
      email: athlete.email || athlete.userId?.email || "",
      role: "athlete",
      createdAt: athlete.createdAt,
    }));

    return [...scoutRows, ...athleteRows]
      .filter((u) => roleFilter === "all" || u.role === roleFilter)
      .filter(
        (u) =>
          !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const diff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return newestFirst ? -diff : diff;
      })
      .slice(0, 5);
  }, [scoutProfiles, athleteProfiles, query, roleFilter, newestFirst]);

  return (
    <div className="space-y-7 pb-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7ddc5a]">
            Community
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#a3acba]">
            Get an overview of your athletes, scouts, and recent registrations.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#7ddc5a]/10 text-[#7ddc5a]">
            <UsersRound size={19} />
          </span>
          <span>
            <span className="block text-2xl font-bold leading-none text-white">
              {loading ? "…" : error ? "—" : total}
            </span>
            <span className="mt-1 block text-xs text-[#a3acba]">
              Total registrations
            </span>
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total signups"
          value={loading ? "…" : error ? "—" : total}
          color="#ffffff"
          sub="Scouts and athletes"
        />
        <Stat
          label="Scouts"
          value={loading ? "…" : isScoutError ? "—" : scouts}
          color={SCOUT_COLOR}
          sub={!loading && !error ? `${pct(scouts)}% of total` : "Scout profiles"}
        />
        <Stat
          label="Athletes"
          value={loading ? "…" : isAthleteError ? "—" : athletes}
          color={ATHLETE_COLOR}
          sub={!loading && !error ? `${pct(athletes)}% of total` : "Athlete profiles"}
        />
        <Stat
          label="Total posts"
          value={isStatsLoading ? "…" : isStatsError ? "—" : (userStats?.totalPosts ?? 0).toLocaleString()}
          color="#8bb8ff"
          sub={isStatsError ? getErrorMessage(statsError) : "Active, non-deleted posts"}
          icon={<FileText size={18} />}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8bb8ff]">Platform activity</p>
            <h2 className="text-xl font-bold text-white">Analytics</h2>
            <p className="mt-1 text-xs text-[#8e98a7]">Daily values use UTC dates.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#a3acba]">Date range
            <select value={analyticsDays} onChange={(event) => setAnalyticsDays(Number(event.target.value))} className="rounded-lg border border-white/10 bg-[#171c24] px-3 py-2 text-sm text-white">
              <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
            </select>
          </label>
        </div>
        {isAnalyticsLoading ? <div className={`${card} p-8 text-center text-sm text-[#9aa4b2]`}>Loading analytics…</div> : isAnalyticsError ? <div className={`${card} flex flex-wrap items-center justify-between gap-3 p-5`}><p className="text-sm text-red-200">{getErrorMessage(analyticsError)}</p><button onClick={() => refetchAnalytics()} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/[0.05]">Try again</button></div> : analytics?.daily?.length ? <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PeriodTotal label="New users" value={analytics.totals.newUsers} color="#7ddc5a" />
            <PeriodTotal label="Posts created" value={analytics.totals.postsCreated} color="#8bb8ff" />
            <PeriodTotal label="Interactions" value={sumInteractions(analytics.totals.interactions)} color="#ffad8c" />
            <PeriodTotal label="Active users" value={analytics.totals.activeUsers} color="#c2a6ff" />
          </div>
          {analytics.daily.length > 0 && analytics.daily.every((item) => Number(item.activeUsers) === 0) && (
            <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#a3acba]">
                {analyticsDays < 90
                  ? "No daily active users were recorded for this range. Try the 90-day range."
                  : "Daily active users are still zero over 90 days. The backend may not have recorded activity for this period."}
              </p>
              {analyticsDays < 90 && <button onClick={() => setAnalyticsDays(90)} className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/[0.05]">Load 90 days</button>}
            </div>
          )}
          {isAnalyticsFetching && <p className="text-right text-xs text-[#8e98a7]">Updating…</p>}
          <div className="grid gap-5 xl:grid-cols-2">
            <AnalyticsChart title="Daily users" data={analytics.daily} series={[{ key: "activeUsers", label: "Active users", color: "#8bb8ff" }, { key: "newUsers", label: "New users", color: "#7ddc5a" }]} />
            <AnalyticsChart title="Daily interactions" data={analytics.daily} series={[{ key: "likes", label: "Likes", color: "#ffad8c" }, { key: "comments", label: "Comments", color: "#8bb8ff" }, { key: "saves", label: "Saves", color: "#c2a6ff" }, { key: "reposts", label: "Reposts", color: "#7ddc5a" }]} />
          </div>
        </> : <div className={`${card} p-8 text-center text-sm text-[#9aa4b2]`}>No analytics data for this period.</div>}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,2fr)]">
        <section className={`${card} flex flex-col p-5 sm:p-6`}>
          <div>
            <h2 className="text-base font-bold text-white">
              Community breakdown
            </h2>
            <p className="mt-1 text-xs text-[#8e98a7]">
              Scouts and athletes across SCAH.
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6">
            <div className="relative">
              <Donut scouts={scouts} athletes={athletes} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {loading ? "…" : error ? "—" : total}
                </span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8792a1]">
                  Profiles
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-[#c3cad4]">
              <Legend color={SCOUT_COLOR} label="Scouts" value={scouts} />
              <Legend color={ATHLETE_COLOR} label="Athletes" value={athletes} />
            </div>
          </div>
        </section>

        <section className={`${card} overflow-hidden`}>
          <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-base font-bold text-white">
                Recent registrations
              </h2>
              <p className="mt-1 text-xs text-[#8e98a7]">
                Search and filter the latest scout and athlete profiles.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-60">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a1]"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or email"
                  aria-label="Search registrations by name or email"
                  className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#0b0e12] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-[#76808e] focus:border-[#7ddc5a]/60 focus:ring-2 focus:ring-[#7ddc5a]/10"
                />
              </label>

              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  aria-label="Filter registrations by role"
                  className="h-10 w-full appearance-none rounded-xl border border-white/[0.09] bg-[#0b0e12] pl-3 pr-9 text-sm text-white outline-none transition focus:border-[#7ddc5a]/60 focus:ring-2 focus:ring-[#7ddc5a]/10 sm:w-32"
                >
                  <option value="all">All roles</option>
                  <option value="scout">Scouts</option>
                  <option value="athlete">Athletes</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8792a1]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3 text-xs text-[#8e98a7]">
            <span>
              {loading
                ? "Loading profiles…"
                : error
                  ? "Profile data unavailable"
                  : `${rows.length} ${
                      rows.length === 1 ? "registration" : "registrations"
                    } shown`}
            </span>
            <button
              type="button"
              onClick={() => setNewestFirst((value) => !value)}
              className="inline-flex items-center gap-1.5 font-semibold text-[#c3cad4] transition hover:text-white"
            >
              <ArrowDownUp size={14} className="text-[#7ddc5a]" />
              {newestFirst ? "Newest first" : "Oldest first"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-y border-white/[0.06] bg-white/[0.025] text-[11px] font-bold uppercase tracking-[0.12em] text-[#8290a0]">
                  <th className="px-5 py-3.5">Person</th>
                  <th className="px-5 py-3.5">Email address</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Registered</th>
                </tr>
              </thead>

              {!loading && !error && rows.length > 0 && (
                <tbody className="divide-y divide-white/[0.055]">
                  {rows.map((user) => {
                    const isScout = user.role === "scout";
                    const accent = isScout ? SCOUT_COLOR : ATHLETE_COLOR;
                    const initialsClass = isScout
                      ? "border-[#f26b3a]/20 bg-[#f26b3a]/[0.08] text-[#ffad8c]"
                      : "border-[#7ddc5a]/20 bg-[#7ddc5a]/[0.08] text-[#a5ed8c]";
                    const hoverClass = isScout
                      ? "group-hover:text-[#ffad8c]"
                      : "group-hover:text-[#a5ed8c]";

                    return (
                      <tr
                        key={`${user.role}-${user.id}`}
                        className="group transition-colors hover:bg-white/[0.035]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-bold ${initialsClass}`}>
                              {getInitials(user.name)}
                            </span>
                            <span className="min-w-0">
                              <span className={`block truncate text-sm font-bold text-[#f4f6f8] transition ${hoverClass}`}>
                                {user.name}
                              </span>
                              <span className="mt-0.5 block text-xs text-[#7f8a99]">
                                {isScout ? "Scout profile" : "Athlete profile"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="max-w-[240px] truncate px-5 py-4 text-sm text-[#aab3bf]">
                          {user.email || "Email not provided"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs font-semibold text-[#c3cad4]">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                            {isScout ? "Scout" : "Athlete"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[#aab3bf]">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>

            {loading && <LoadingState />}
            {!loading && error && (
              <StateMessage
                title="We couldn’t load the dashboard profiles"
                description={error}
                error
              />
            )}
            {!loading && !error && rows.length === 0 && (
              <StateMessage
                title={total === 0 ? "No registrations yet" : "No results found"}
                description={
                  total === 0
                    ? "Scout and athlete profiles will appear here once they join the community."
                    : "Try another name, email address, or role filter."
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
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

  return "Could not load signups. Please try again.";
}

function Stat({ label, value, color, sub, icon }) {
  return (
    <div className={`${card} flex items-center justify-between gap-4 p-5 sm:p-6`}>
      <div>
        <p className="text-3xl font-bold leading-none tracking-tight text-white sm:text-4xl">
          {value}
        </p>
        <p className="mt-3 text-sm font-bold text-[#e5e8ed]">{label}</p>
        {sub && <p className="mt-1 text-xs text-[#8e98a7]">{sub}</p>}
      </div>
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
        style={{ color, backgroundColor: `${color}18` }}
      >
        {icon || (label === "Total signups" ? (
          <UsersRound size={19} />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        ))}
      </span>
    </div>
  );
}

function PeriodTotal({ label, value, color }) {
  return (
    <div className={`${card} p-4`}>
      <p className="text-xs font-medium text-[#8e98a7]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString() : "—"}</p>
      <span className="mt-2 block h-1 w-8 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );
}

function AnalyticsChart({ title, data, series }) {
  const chartData = data.map((item) => ({
    ...item,
    ...Object.fromEntries(series.map((line) => [line.key, Number(item[line.key] ?? item.interactions?.[line.key]) || 0])),
  }));

  return (
    <section className={`${card} min-w-0 p-4 sm:p-5`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-white">{title}</h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {series.map((line) => <span key={line.key} className="inline-flex items-center gap-1.5 text-[11px] text-[#a3acba]"><span className="h-2 w-2 rounded-full" style={{ background: line.color }} />{line.label}</span>)}
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatAnalyticsAxis} interval={Math.max(0, Math.ceil(chartData.length / 7) - 1)} tick={{ fill: "#8e98a7", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} minTickGap={12} />
            <YAxis allowDecimals={false} width={38} tick={{ fill: "#8e98a7", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip labelFormatter={formatAnalyticsTooltip} formatter={(value, name) => [Number(value).toLocaleString(), name]} contentStyle={{ background: "#171c24", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#f4f6f8" }} labelStyle={{ color: "#c3cad4", marginBottom: 6 }} itemStyle={{ padding: 0 }} />
            {series.map((line) => <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function formatAnalyticsAxis(value) {
  const date = parseUtcDate(value);
  return date ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", timeZone: "UTC" }) : value;
}

function formatAnalyticsTooltip(value) {
  const date = parseUtcDate(value);
  return date ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }) : value;
}

function parseUtcDate(value) {
  if (typeof value !== "string") return null;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sumInteractions(interactions) {
  if (!interactions) return undefined;
  return [interactions.likes, interactions.comments, interactions.saves, interactions.reposts].reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function Legend({ color, label, value }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
      <span className="font-bold text-white">{value}</span>
    </span>
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

function LoadingState() {
  return (
    <div className="space-y-4 px-5 py-5" aria-label="Loading profiles">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4">
          <span className="h-10 w-10 rounded-full bg-white/[0.07]" />
          <span className="h-3 w-1/5 rounded bg-white/[0.07]" />
          <span className="ml-auto h-3 w-1/4 rounded bg-white/[0.05]" />
          <span className="hidden h-3 w-16 rounded bg-white/[0.05] sm:block" />
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

function Donut({ scouts, athletes }) {
  const total = scouts + athletes;
  const r = 42;
  const c = 2 * Math.PI * r;
  const scoutLen = total ? (scouts / total) * c : 0;
  const athleteLen = total ? (athletes / total) * c : 0;

  return (
    <svg
      viewBox="0 0 100 100"
      className="h-44 w-44 -rotate-90"
      role="img"
      aria-label={`${scouts} scouts and ${athletes} athletes`}
    >
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="14"
      />
      {total > 0 && (
        <>
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={SCOUT_COLOR}
            strokeWidth="14"
            strokeDasharray={`${scoutLen} ${c - scoutLen}`}
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={ATHLETE_COLOR}
            strokeWidth="14"
            strokeDasharray={`${athleteLen} ${c - athleteLen}`}
            strokeDashoffset={-scoutLen}
          />
        </>
      )}
    </svg>
  );
}
