"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Flag, RefreshCw, Shield, ShieldOff } from "lucide-react";
import {
  useBanReportedAccountMutation,
  useGetAdminReportsQuery,
  useGetReportedAccountPostsQuery,
  useGetReportedAccountProfileQuery,
  useResolveAdminReportMutation,
  useUnbanReportedAccountMutation,
} from "@/app/redux/api/adminReportsApi";

type ReportStatus = "pending" | "reviewed" | "action_taken" | "dismissed";
type Person = { userId?: string; _id?: string; id?: string; name?: string; fullName?: string; firstName?: string; lastName?: string; email?: string };
type Report = { _id?: string; id?: string; reportId?: string; reason?: string; details?: string | null; status?: ReportStatus; createdAt?: string; reporter?: Person | string; reportedUser?: Person | string; reportedAccount?: Person | string; reported?: Person | string };
const STATUSES: ReportStatus[] = ["pending", "reviewed", "action_taken", "dismissed"];
const card = "rounded-2xl border border-white/[0.08] bg-[#11151b] shadow-[0_20px_60px_rgba(0,0,0,0.16)]";

export default function AccountReportsPage() {
  const [status, setStatus] = useState<ReportStatus>("pending");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const { currentData, error, isError, isFetching, isLoading, refetch } = useGetAdminReportsQuery({ status, page, limit: 20 });
  const [resolveReport, resolveState] = useResolveAdminReportMutation();
  const [banAccount, banState] = useBanReportedAccountMutation();
  const [unbanAccount, unbanState] = useUnbanReportedAccountMutation();

  const reports: Report[] = currentData?.reports ?? currentData?.items ?? currentData?.data?.reports ?? (Array.isArray(currentData?.data) ? currentData.data : []);
  const pagination = currentData?.pagination ?? currentData?.data?.pagination ?? {};
  const totalPages = Math.max(1, pagination.totalPages ?? pagination.pages ?? 1);
  const total = pagination.totalResults ?? pagination.total ?? reports.length;
  const selected = reports.find((report) => reportKey(report) === selectedId) ?? null;
  const account = getPerson(selected?.reportedUser ?? selected?.reportedAccount ?? selected?.reported);
  const userId = account?.userId ?? account?._id ?? account?.id ?? (typeof (selected?.reportedUser ?? selected?.reportedAccount ?? selected?.reported) === "string" ? selected?.reportedUser ?? selected?.reportedAccount ?? selected?.reported as string : "");
  const profileQuery = useGetReportedAccountProfileQuery(userId, { skip: !userId });
  const postsQuery = useGetReportedAccountPostsQuery({ userId, page: 1, limit: 20 }, { skip: !userId });
  const profile = profileQuery.currentData?.profile ?? profileQuery.currentData?.user ?? profileQuery.currentData;
  const posts = postsQuery.currentData?.posts ?? postsQuery.currentData?.items ?? postsQuery.currentData?.data?.posts ?? (Array.isArray(postsQuery.currentData?.data) ? postsQuery.currentData.data : []);
  const busy = resolveState.isLoading || banState.isLoading || unbanState.isLoading;
  const requestError = isError ? errorText(error) : "";

  const selectStatus = (next: ReportStatus) => { setStatus(next); setPage(1); setSelectedId(""); setActionMessage(""); };
  const updateStatus = async (next: Exclude<ReportStatus, "pending">) => {
    if (!selected) return;
    setActionMessage("");
    try {
      await resolveReport({ reportId: reportKey(selected), status: next, resolutionNote }).unwrap();
      setActionMessage("Report updated.");
      setResolutionNote("");
    } catch (err) { setActionMessage(errorText(err)); }
  };
  const submitBan = async () => {
    if (!userId || !banReason.trim()) return;
    const days = banDays ? Number(banDays) : undefined;
    if (banDays && (!Number.isInteger(days) || days! < 1 || days! > 365)) { setActionMessage("Temporary ban must be between 1 and 365 whole days."); return; }
    const duration = days ? ` for ${days} days` : " permanently";
    if (!window.confirm(`Ban ${personName(account)}${duration}? This will block login and authenticated requests.`)) return;
    setActionMessage("");
    let banSucceeded = false;
    try {
      await banAccount({ userId, reason: banReason, days }).unwrap();
      banSucceeded = true;
      await Promise.all([refetch(), profileQuery.refetch(), postsQuery.refetch()]);
      await resolveReport({ reportId: reportKey(selected!), status: "action_taken", resolutionNote: resolutionNote || "Account banned after report review." }).unwrap();
      setActionMessage("Account banned and report marked as action taken.");
      setBanReason(""); setBanDays(""); setResolutionNote("");
    } catch (err) {
      if (banSucceeded) await Promise.all([refetch(), profileQuery.refetch(), postsQuery.refetch()]);
      setActionMessage(banSucceeded ? `Account was banned, but report update failed: ${errorText(err)}` : errorText(err));
    }
  };
  const submitUnban = async () => {
    if (!userId || !window.confirm(`Unban ${personName(account)}?`)) return;
    setActionMessage("");
    try {
      await unbanAccount(userId).unwrap();
      await Promise.all([refetch(), profileQuery.refetch(), postsQuery.refetch()]);
      setActionMessage("Account unbanned. The report remains in its current status.");
    } catch (err) { setActionMessage(errorText(err)); }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffad8c]">Moderation</p><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Account reports</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#a3acba]">Review report context and account activity, then record a resolution.</p></div>
        <button onClick={() => refetch()} disabled={isFetching} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-semibold text-[#e5e9ef] hover:bg-white/[0.08] disabled:opacity-50"><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />Refresh</button>
      </header>

      <section className={`${card} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-white">Reports</h2><p className="mt-1 text-xs text-[#8e98a7]">{isLoading ? "Loading reports…" : requestError || `${total} reports · page ${page} of ${totalPages}`}</p></div><label className="flex items-center gap-2 text-sm text-[#a3acba]">Status<select value={status} onChange={(event) => selectStatus(event.target.value as ReportStatus)} className="rounded-lg border border-white/10 bg-[#171c24] px-3 py-2 text-sm text-white">{STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label></div>
        {isLoading ? <StateBox>Loading reports…</StateBox> : requestError ? <StateBox error>{requestError}<button className="ml-3 underline" onClick={() => refetch()}>Try again</button></StateBox> : reports.length === 0 ? <StateBox>No {label(status).toLowerCase()} reports found.</StateBox> : <div className="divide-y divide-white/[0.07]">{reports.map((report) => { const id = reportKey(report); const reporter = getPerson(report.reporter); const reported = getPerson(report.reportedUser ?? report.reportedAccount ?? report.reported); return <button key={id} onClick={() => { setSelectedId(id); setActionMessage(""); }} className={`block w-full rounded-xl px-3 py-4 text-left transition hover:bg-white/[0.04] ${selectedId === id ? "bg-white/[0.05]" : ""}`}><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-white">{report.reason || "Unspecified reason"}</span><span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#c0c8d4]">{label(report.status ?? status)}</span></span><span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#a3acba]"><span>Reported account: {personName(reported)}{reported?.email ? ` · ${reported.email}` : ""}</span><span>By: {personName(reporter)}{reporter?.email ? ` · ${reporter.email}` : ""}</span><span>{dateText(report.createdAt)}</span></span>{report.details && <span className="mt-2 block line-clamp-2 text-sm text-[#8e98a7]">{report.details}</span>}</button>; })}</div>}
        <div className="flex items-center justify-between border-t border-white/[0.07] pt-4"><span className="text-xs text-[#8e98a7]">20 per page · {total} total</span><div className="flex gap-2"><PageButton disabled={page <= 1 || isFetching} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} />Previous</PageButton><PageButton disabled={page >= totalPages || isFetching} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight size={16} /></PageButton></div></div>
      </section>

      {selected && <section className={`${card} p-4 sm:p-6`}>
        <div className="flex items-start gap-3 border-b border-white/[0.07] pb-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f26b3a]/10 text-[#ffad8c]"><Flag size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffad8c]">Report review</p><h2 className="mt-1 text-xl font-bold text-white">{reportKey(selected)}</h2></div></div>
        <div className="grid gap-4 border-b border-white/[0.07] py-5 md:grid-cols-2"><Info label="Reason" value={selected.reason || "Unspecified reason"} /><Info label="Reported" value={`${personName(account)}${account?.email ? ` · ${account.email}` : ""}`} /><Info label="Reporter" value={personName(getPerson(selected.reporter))} /><Info label="Created" value={dateText(selected.createdAt)} /><div className="md:col-span-2"><Info label="Details" value={selected.details?.trim() || "No additional details provided."} /></div></div>
        <div className="grid gap-5 py-5 lg:grid-cols-2"><div><h3 className="mb-3 font-bold text-white">Reported account</h3>{!userId ? <StateBox error>Report response does not include the reported account userId.</StateBox> : profileQuery.isLoading ? <StateBox>Loading account profile…</StateBox> : profileQuery.isError ? <StateBox error>{errorText(profileQuery.error)}</StateBox> : <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"><Info label="Name" value={personName(profile ?? account)} /><Info label="Email" value={profile?.email ?? account?.email ?? "Not provided"} /><Info label="Account ID" value={userId} /><Info label="Role" value={profile?.role ?? profile?.accountType ?? "Not provided"} /><Info label="Ban status" value={profile?.isBanned ? "Banned" : profile?.banUntil ? `Banned until ${dateText(profile.banUntil)}` : "No ban indicated"} />{profile?.banReason && <Info label="Ban reason" value={profile.banReason} />}</div>}
          <h3 className="mb-3 mt-5 font-bold text-white">Recent posts</h3>{postsQuery.isLoading ? <StateBox>Loading posts…</StateBox> : postsQuery.isError ? <StateBox error>{errorText(postsQuery.error)}<p className="mt-1 text-xs">The admin feed request requires a completed onboarding profile.</p></StateBox> : posts.length === 0 ? <StateBox>No recent posts.</StateBox> : <div className="max-h-72 space-y-2 overflow-y-auto">{posts.map((post: { _id?: string; id?: string; caption?: string; text?: string; createdAt?: string; type?: string }, index: number) => <article key={post._id ?? post.id ?? index} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"><p className="whitespace-pre-wrap text-sm text-[#d5dbe4]">{post.caption || post.text || "(No text caption)"}</p><p className="mt-2 text-xs text-[#8e98a7]">{post.type || "Post"} · {dateText(post.createdAt)}</p></article>)}</div>}</div>
          <div><h3 className="mb-3 font-bold text-white">Resolve report</h3><label className="block text-xs font-semibold text-[#a3acba]">Resolution note <span className="font-normal">(optional, max 1000 characters)</span><textarea value={resolutionNote} maxLength={1000} onChange={(event) => setResolutionNote(event.target.value)} rows={3} placeholder="Record what you reviewed or decided" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0d1117] px-3.5 py-3 text-sm text-white outline-none focus:border-[#f26b3a]" /></label><div className="mt-3 flex flex-wrap gap-2">{(["reviewed", "action_taken", "dismissed"] as const).map((next) => <button key={next} disabled={busy} onClick={() => updateStatus(next)} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white hover:bg-white/[0.08] disabled:opacity-50">Mark {label(next)}</button>)}</div>
            <div className="mt-6 border-t border-white/[0.07] pt-5"><h3 className="flex items-center gap-2 font-bold text-white"><Shield size={17} />Account access</h3><p className="mt-1 text-xs leading-5 text-[#8e98a7]">Bans block login and authenticated requests. Temporary bans expire automatically.</p><label className="mt-3 block text-xs font-semibold text-[#a3acba]">Ban reason<input value={banReason} onChange={(event) => setBanReason(event.target.value)} maxLength={1000} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#f26b3a]" placeholder="Reason for ban" /></label><label className="mt-3 block text-xs font-semibold text-[#a3acba]">Temporary duration in days <span className="font-normal">(leave empty for permanent)</span><input type="number" min={1} max={365} step={1} value={banDays} onChange={(event) => setBanDays(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#f26b3a]" placeholder="1–365 days" /></label><div className="mt-3 flex flex-wrap gap-2"><button disabled={!userId || !banReason.trim() || busy} onClick={submitBan} className="inline-flex items-center gap-2 rounded-lg bg-[#a33e31] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#bd4b3c] disabled:opacity-50"><Shield size={15} />Ban account</button><button disabled={!userId || busy} onClick={submitUnban} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-sm font-semibold text-white hover:bg-white/[0.06] disabled:opacity-50"><ShieldOff size={15} />Unban account</button></div></div>
            {actionMessage && <p role="status" className={`mt-4 rounded-lg border px-3 py-2 text-sm ${actionMessage.toLowerCase().includes("failed") || actionMessage.toLowerCase().includes("must be") || actionMessage.toLowerCase().includes("error") ? "border-red-400/20 bg-red-400/5 text-red-200" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"}`}>{actionMessage}</p>}
          </div>
        </div>
      </section>}
    </div>
  );
}

function reportKey(report: Report) { return report.reportId ?? report._id ?? report.id ?? ""; }
function getPerson(person?: Person | string | null): Person | null { return typeof person === "string" ? { userId: person } : person ?? null; }
function personName(person?: Person | null) { return person?.name || person?.fullName || [person?.firstName, person?.lastName].filter(Boolean).join(" ") || person?.email || "Unknown account"; }
function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
function dateText(value?: string) { if (!value) return "Date unavailable"; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
function errorText(error: unknown): string { const value = error as { data?: { message?: string }; message?: string }; return value?.data?.message || value?.message || "The request failed. Please try again."; }
function StateBox({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div className={`my-4 rounded-xl border px-4 py-6 text-center text-sm ${error ? "border-red-400/20 bg-red-400/[0.04] text-red-200" : "border-white/[0.07] bg-white/[0.02] text-[#9aa4b2]"}`}>{children}</div>; }
function Info({ label: title, value }: { label: string; value: string }) { return <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7f8998]">{title}</p><p className="mt-1 break-words text-sm leading-6 text-[#e2e7ee]">{value}</p></div>; }
function PageButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) { return <button disabled={disabled} onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#dce2ea] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40">{children}</button>; }
