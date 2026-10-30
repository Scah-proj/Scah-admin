"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Flag, RefreshCw, Shield, ShieldOff, X } from "lucide-react";
import { toast } from "sonner";
import { useGetPostByIdQuery } from "@/app/redux/api/feedApi";
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
type Report = { _id?: string; id?: string; reportId?: string; reason?: string; details?: string | null; status?: ReportStatus; createdAt?: string; reportedAt?: string; updatedAt?: string; reporter?: Person | string; reportedUser?: Person | string; reportedAccount?: Person | string; reported?: Person | string };
const STATUSES: ReportStatus[] = ["pending", "reviewed", "action_taken", "dismissed"];
const card = "rounded-2xl border border-white/[0.08] bg-[#11151b] shadow-[0_20px_60px_rgba(0,0,0,0.16)]";

export default function AccountReportsPage() {
  const [status, setStatus] = useState<ReportStatus>("pending");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [selectedPostId, setSelectedPostId] = useState("");
  const [selectedPostDate, setSelectedPostDate] = useState<string | number | undefined>();
  const [confirmation, setConfirmation] = useState<"ban" | "unban" | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState("");
  const { currentData, error, isError, isFetching, isLoading, refetch } = useGetAdminReportsQuery({ status, page, limit: 20 });
  const [resolveReport, resolveState] = useResolveAdminReportMutation();
  const [banAccount, banState] = useBanReportedAccountMutation();
  const [unbanAccount, unbanState] = useUnbanReportedAccountMutation();

  const reports: Report[] = currentData?.reports ?? currentData?.items ?? currentData?.data?.reports ?? (Array.isArray(currentData?.data) ? currentData.data : []);
  const pagination = currentData?.pagination ?? currentData?.data?.pagination ?? {};
  const totalPages = Math.max(1, pagination.totalPages ?? pagination.pages ?? 1);
  const total = pagination.totalResults ?? pagination.total ?? reports.length;
  const selected = reports.find((report) => reportKey(report) === selectedId) ?? null;
  const reportedAccount = selected?.reportedUser ?? selected?.reportedAccount ?? selected?.reported;
  const account = getPerson(reportedAccount);
  const userId = account?.userId ?? account?._id ?? account?.id ?? (typeof reportedAccount === "string" ? reportedAccount : "");
  const profileQuery = useGetReportedAccountProfileQuery(userId, { skip: !userId });
  const postsQuery = useGetReportedAccountPostsQuery({ userId, page: 1, limit: 20 }, { skip: !userId });
  const postDetailQuery = useGetPostByIdQuery(selectedPostId, { skip: !selectedPostId });
  const profile = (profileQuery.currentData?.profile ?? profileQuery.currentData?.user ?? profileQuery.currentData) as (Person & { role?: string; accountType?: string; isBanned?: boolean; banUntil?: string; banReason?: string }) | undefined;
  const posts = postsQuery.currentData?.posts ?? postsQuery.currentData?.items ?? postsQuery.currentData?.data?.posts ?? (Array.isArray(postsQuery.currentData?.data) ? postsQuery.currentData.data : []);
  const busy = resolveState.isLoading || banState.isLoading || unbanState.isLoading;
  const requestError = isError ? errorText(error) : "";

  const selectStatus = (next: ReportStatus) => { setStatus(next); setPage(1); setSelectedId(""); setSelectedPostId(""); setSelectedPostDate(undefined); };
  const updateStatus = async (next: Exclude<ReportStatus, "pending">) => {
    if (!selected) return;
    try {
      await resolveReport({ reportId: reportKey(selected), status: next, resolutionNote }).unwrap();
      toast.success("Report updated.");
      setResolutionNote("");
    } catch (err) { toast.error(errorText(err)); }
  };
  const submitBan = async () => {
    if (!userId || !banReason.trim()) return;
    const days = banDays ? Number(banDays) : undefined;
    if (banDays && (!Number.isInteger(days) || days! < 1 || days! > 365)) { toast.error("Temporary ban must be between 1 and 365 whole days."); return; }
    let banSucceeded = false;
    try {
      await banAccount({ userId, reason: banReason, days }).unwrap();
      banSucceeded = true;
      await Promise.all([refetch(), profileQuery.refetch(), postsQuery.refetch()]);
      await resolveReport({ reportId: reportKey(selected!), status: "action_taken", resolutionNote: resolutionNote || "Account banned after report review." }).unwrap();
      toast.success("Account banned and report marked as action taken.");
      setBanReason(""); setBanDays(""); setResolutionNote("");
    } catch (err) {
      if (banSucceeded) await Promise.all([refetch(), profileQuery.refetch(), postsQuery.refetch()]);
      toast.error(banSucceeded ? `Account was banned, but report update failed: ${errorText(err)}` : errorText(err));
    }
    setConfirmation(null);
  };
  const submitUnban = async () => {
    if (!userId) return;
    try {
      await unbanAccount(userId).unwrap();
      await Promise.all([refetch(), profileQuery.refetch(), postsQuery.refetch()]);
      toast.success("Account unbanned. The report remains in its current status.");
    } catch (err) { toast.error(errorText(err)); }
    setConfirmation(null);
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffad8c]">Moderation</p><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Account reports</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#a3acba]">Review report context and account activity, then record a resolution.</p></div>
        <button onClick={() => refetch()} disabled={isFetching} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-semibold text-[#e5e9ef] hover:bg-white/[0.08] disabled:opacity-50"><RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />Refresh</button>
      </header>

      <section className={`${card} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-white">Reports</h2><p className="mt-1 text-xs text-[#8e98a7]">{isLoading ? "Loading reports…" : requestError || `${total} reports · page ${page} of ${totalPages}`}</p></div><label className="flex items-center gap-2 text-sm text-[#a3acba]">Status<select value={status} onChange={(event) => selectStatus(event.target.value as ReportStatus)} className="rounded-lg border border-white/10 bg-[#171c24] px-3 py-2 text-sm text-white">{STATUSES.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label></div>
        {isLoading ? <StateBox>Loading reports…</StateBox> : requestError ? <StateBox error>{requestError}<button className="ml-3 underline" onClick={() => refetch()}>Try again</button></StateBox> : reports.length === 0 ? <StateBox>No {label(status).toLowerCase()} reports found.</StateBox> : <div className="divide-y divide-white/[0.07]">{reports.map((report) => { const id = reportKey(report); const reporter = getPerson(report.reporter); const reported = getPerson(report.reportedUser ?? report.reportedAccount ?? report.reported); return <button key={id} onClick={() => { setSelectedId(id); }} className={`block w-full rounded-xl px-3 py-4 text-left transition hover:bg-white/[0.04] ${selectedId === id ? "bg-white/[0.05]" : ""}`}><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-white">{report.reason || "Unspecified reason"}</span><span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#c0c8d4]">{label(report.status ?? status)}</span></span><span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#a3acba]"><span>Reported account: {personName(reported)}{reported?.email ? ` · ${reported.email}` : ""}</span><span>By: {personName(reporter)}{reporter?.email ? ` · ${reporter.email}` : ""}</span><span>Reported {dateText(report.createdAt ?? report.reportedAt)}</span></span>{report.details && <span className="mt-2 block line-clamp-2 text-sm text-[#8e98a7]">{report.details}</span>}</button>; })}</div>}
        <div className="flex items-center justify-between border-t border-white/[0.07] pt-4"><span className="text-xs text-[#8e98a7]">20 per page · {total} total</span><div className="flex gap-2"><PageButton disabled={page <= 1 || isFetching} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} />Previous</PageButton><PageButton disabled={page >= totalPages || isFetching} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight size={16} /></PageButton></div></div>
      </section>

      {selected && <section className={`${card} p-4 sm:p-6`}>
        <div className="flex items-start gap-3 border-b border-white/[0.07] pb-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f26b3a]/10 text-[#ffad8c]"><Flag size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffad8c]">Report review</p><h2 className="mt-1 text-xl font-bold text-white">{reportKey(selected)}</h2></div></div>
        <div className="grid gap-4 border-b border-white/[0.07] py-5 md:grid-cols-2"><Info label="Reason" value={selected.reason || "Unspecified reason"} /><Info label="Reported" value={`${personName(account)}${account?.email ? ` · ${account.email}` : ""}`} /><Info label="Reporter" value={personName(getPerson(selected.reporter))} /><Info label="Created" value={dateText(selected.createdAt ?? selected.reportedAt)} /><div className="md:col-span-2"><Info label="Details" value={selected.details?.trim() || "No additional details provided."} /></div></div>
        <div className="grid gap-5 py-5 lg:grid-cols-2"><div><h3 className="mb-3 font-bold text-white">Reported account</h3>{!userId ? <StateBox error>Report response does not include the reported account userId.</StateBox> : profileQuery.isLoading ? <StateBox>Loading account profile…</StateBox> : profileQuery.isError ? <StateBox error>{errorText(profileQuery.error)}</StateBox> : <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"><Info label="Name" value={personName(profile ?? account)} /><Info label="Email" value={profile?.email ?? account?.email ?? "Not provided"} /><Info label="Account ID" value={userId} /><Info label="Role" value={profile?.role ?? profile?.accountType ?? "Not provided"} /><Info label="Ban status" value={profile?.isBanned ? "Banned" : profile?.banUntil ? `Banned until ${dateText(profile.banUntil)}` : "No ban indicated"} />{profile?.banReason && <Info label="Ban reason" value={profile.banReason} />}</div>}
          <h3 className="mb-3 mt-5 font-bold text-white">Recent posts</h3>{postsQuery.isLoading ? <StateBox>Loading posts…</StateBox> : postsQuery.isError ? <StateBox error>{errorText(postsQuery.error)}<p className="mt-1 text-xs">The admin feed request requires a completed onboarding profile.</p></StateBox> : posts.length === 0 ? <StateBox>No recent posts.</StateBox> : <div className="max-h-72 space-y-2 overflow-y-auto">{posts.map((post: { _id?: string; id?: string; caption?: string; text?: string; createdAt?: string; created_at?: string; publishedAt?: string; published_at?: string; postedAt?: string; posted_at?: string; timestamp?: string | number; date?: string; updatedAt?: string; type?: string }, index: number) => { const postId = post._id ?? post.id; return <button type="button" key={postId ?? index} onClick={() => { if (postId) { setSelectedPostId(postId); setSelectedPostDate(postDateValue(post)); } }} disabled={!postId} className="block w-full rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition hover:border-[#f26b3a]/40 hover:bg-white/[0.04] disabled:opacity-60"><p className="whitespace-pre-wrap text-sm text-[#d5dbe4]">{post.caption || post.text || "(No text caption)"}</p><p className="mt-2 text-xs text-[#8e98a7]">{post.type || "Post"} · {dateText(postDateValue(post), post._id ?? post.id)}</p></button>; })}</div>}</div>
          <div><h3 className="mb-3 font-bold text-white">Resolve report</h3><label className="block text-xs font-semibold text-[#a3acba]">Resolution note <span className="font-normal">(optional, max 1000 characters)</span><textarea value={resolutionNote} maxLength={1000} onChange={(event) => setResolutionNote(event.target.value)} rows={3} placeholder="Record what you reviewed or decided" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#0d1117] px-3.5 py-3 text-sm text-white outline-none focus:border-[#f26b3a]" /></label><div className="mt-3 flex flex-wrap gap-2">{(["reviewed", "action_taken", "dismissed"] as const).map((next) => <button key={next} disabled={busy} onClick={() => updateStatus(next)} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white hover:bg-white/[0.08] disabled:opacity-50">Mark {label(next)}</button>)}</div>
            <div className="mt-6 border-t border-white/[0.07] pt-5"><h3 className="flex items-center gap-2 font-bold text-white"><Shield size={17} />Account access</h3><p className="mt-1 text-xs leading-5 text-[#8e98a7]">Bans block login and authenticated requests. Temporary bans expire automatically.</p><label className="mt-3 block text-xs font-semibold text-[#a3acba]">Ban reason<input value={banReason} onChange={(event) => setBanReason(event.target.value)} maxLength={1000} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#f26b3a]" placeholder="Reason for ban" /></label><label className="mt-3 block text-xs font-semibold text-[#a3acba]">Temporary duration in days <span className="font-normal">(leave empty for permanent)</span><input type="number" min={1} max={365} step={1} value={banDays} onChange={(event) => setBanDays(event.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0d1117] px-3 py-2 text-sm text-white outline-none focus:border-[#f26b3a]" placeholder="1–365 days" /></label><div className="mt-3 flex flex-wrap gap-2"><button disabled={!userId || !banReason.trim() || busy} onClick={() => setConfirmation("ban")} className="inline-flex items-center gap-2 rounded-lg bg-[#a33e31] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#bd4b3c] disabled:opacity-50"><Shield size={15} />Ban account</button><button disabled={!userId || busy} onClick={() => setConfirmation("unban")} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-sm font-semibold text-white hover:bg-white/[0.06] disabled:opacity-50"><ShieldOff size={15} />Unban account</button></div></div>

          </div>
        </div>
      </section>}

      {confirmation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmation(null); }}><section role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151a22] p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffad8c]">Confirm account action</p><h2 id="confirmation-title" className="mt-2 text-xl font-bold text-white">{confirmation === "ban" ? "Ban this account?" : "Unban this account?"}</h2></div><button type="button" aria-label="Close confirmation" onClick={() => setConfirmation(null)} className="rounded-lg p-2 text-[#a3acba] hover:bg-white/10 hover:text-white"><X size={18} /></button></div><p className="mt-3 text-sm leading-6 text-[#a3acba]">{confirmation === "ban" ? `Ban ${personName(account)}${banDays ? ` for ${banDays} days` : " permanently"}? This blocks login and authenticated requests.` : `Unban ${personName(account)}?`}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setConfirmation(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.06]">Cancel</button><button type="button" disabled={busy} onClick={confirmation === "ban" ? submitBan : submitUnban} className="rounded-lg bg-[#a33e31] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bd4b3c] disabled:opacity-50">{busy ? "Working..." : confirmation === "ban" ? "Confirm ban" : "Confirm unban"}</button></div></section></div>}

      {selectedPostId && <PostDetailsDialog query={postDetailQuery} dateFallback={selectedPostDate} onClose={() => { setSelectedPostId(""); setSelectedPostDate(undefined); }} />}
    </div>
  );
}

function PostDetailsDialog({ query, dateFallback, onClose }: { query: { isLoading: boolean; isError: boolean; error?: unknown; currentData?: unknown }; dateFallback?: string | number; onClose: () => void }) {
  const post = unwrapPostResponse(query.currentData);
  const media = collectPostMedia(post);
  const text = (value: unknown) => typeof value === "string" && value.trim() ? value : "Not provided";
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="post-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#151a22] p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffad8c]">Reported account post</p><h2 id="post-detail-title" className="mt-1 text-xl font-bold text-white">Post details</h2></div><button type="button" aria-label="Close post details" onClick={onClose} className="rounded-lg p-2 text-[#a3acba] hover:bg-white/10 hover:text-white"><X size={18} /></button></div>{query.isLoading ? <StateBox>Loading post details…</StateBox> : query.isError ? <StateBox error>{errorText(query.error)}<button onClick={() => onClose()} className="ml-3 underline">Close</button></StateBox> : !post ? <StateBox error>No post details were returned.</StateBox> : <div className="space-y-5 pt-5"><p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#e2e7ee]">{text(post.caption ?? post.text ?? post.content)}</p><div className="grid gap-4 sm:grid-cols-2"><Info label="Post ID" value={text(post._id ?? post.id)} /><Info label="Type" value={text(post.type)} /><Info label="Sport" value={text(post.sport)} /><Info label="Created" value={dateText(postDateValue(post) ?? dateFallback, String(post._id ?? post.id ?? ""))} /><Info label="Updated" value={dateText(postDateValue(post, true))} /><Info label="Author" value={personName(getPerson((post.author ?? post.user ?? post.owner) as Person | string | undefined))} /></div>{media.length > 0 && <div><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#7f8998]">Media ({media.length})</h3><div className="grid gap-3 sm:grid-cols-2">{media.map((item, index) => { const mediaItem = typeof item === "string" ? item : (item as { url?: string; mediaUrl?: string; type?: string })?.url ?? (item as { mediaUrl?: string })?.mediaUrl; return mediaItem ? <div key={`${mediaItem}-${index}`} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-2">{isVideoMedia(item, mediaItem) ? <video src={mediaItem} controls preload="metadata" className="max-h-[28rem] w-full rounded-lg bg-black" /> : <a href={mediaItem} target="_blank" rel="noreferrer"><img src={mediaItem} alt={`Post image ${index + 1}`} className="max-h-[28rem] w-full rounded-lg object-contain bg-black" /></a>}<a key={`${mediaItem}-link`} href={mediaItem} target="_blank" rel="noreferrer" className="block break-all text-xs text-[#ffad8c] underline">{mediaItem}</a></div> : null; })}</div></div>}{<details className="rounded-xl border border-white/10 bg-black/10 p-3"><summary className="cursor-pointer text-sm font-semibold text-[#a3acba]">All post data</summary><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs text-[#c9d1dc]">{JSON.stringify(post, null, 2)}</pre></details>}</div>}</section></div>;
}

function reportKey(report: Report) { return report.reportId ?? report._id ?? report.id ?? ""; }
function getPerson(person?: Person | string | null): Person | null { return typeof person === "string" ? { userId: person } : person ?? null; }
function personName(person?: Person | null) { return person?.name || person?.fullName || [person?.firstName, person?.lastName].filter(Boolean).join(" ") || person?.email || "Unknown account"; }
function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()); }
function dateText(value?: string | number, fallbackId?: string) {
  const numericTimestamp = typeof value === "number" ? value : typeof value === "string" && /^\d{10,13}$/.test(value) ? Number(value) : null;
  const normalizedTimestamp = numericTimestamp == null ? null : numericTimestamp < 1_000_000_000_000 ? numericTimestamp * 1000 : numericTimestamp;
  let date = value == null || value === "" ? null : normalizedTimestamp == null ? new Date(value) : new Date(normalizedTimestamp);
  if (!date || Number.isNaN(date.getTime())) {
    const match = fallbackId?.match(/^[a-f\d]{8}[a-f\d]{16}$/i);
    date = match ? new Date(parseInt(match[0].slice(0, 8), 16) * 1000) : null;
  }
  if (!date || Number.isNaN(date.getTime())) return value == null || value === "" ? "Date unavailable" : String(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" }).format(date);
}
function postDateValue(post: object, updated = false): string | number | undefined {
  const fields = post as Record<string, unknown>;
  const keys = updated
    ? ["updatedAt", "updated_at", "modifiedAt", "modified_at"]
    : ["createdAt", "created_at", "publishedAt", "published_at", "postedAt", "posted_at", "timestamp", "timeStamp", "dateTime", "date", "createdOn", "creationDate"];
  for (const key of keys) {
    const value = fields[key];
    if (typeof value === "string" || typeof value === "number") return value;
    if (value && typeof value === "object") {
      const nested = value as { $date?: unknown; date?: unknown; timestamp?: unknown };
      const nestedValue = nested.$date ?? nested.date ?? nested.timestamp;
      if (typeof nestedValue === "string" || typeof nestedValue === "number") return nestedValue;
    }
  }
  return undefined;
}
function collectPostMedia(post?: Record<string, unknown>) {
  const result: unknown[] = [];
  const mediaKeys = new Set(["media", "mediaFiles", "mediaItems", "images", "image", "imageUrl", "imageURL", "imageUrls", "photos", "photo", "picture", "pictureUrl", "thumbnail", "thumbnailUrl", "coverImage", "coverPhoto", "attachments", "files", "assets", "video", "videos", "videoUrl", "mediaUrl", "media_url"]);
  const urlKeys = ["url", "mediaUrl", "media_url", "imageUrl", "imageURL", "videoUrl", "fileUrl", "file_url", "secure_url", "download_url", "src", "srcUrl", "path"];
  const visit = (value: unknown, inMedia: boolean) => {
    if (!value) return;
    if (Array.isArray(value)) { value.forEach((item) => visit(item, inMedia)); return; }
    if (typeof value === "string") { if (inMedia && /^(https?:|blob:|data:image\/|\/|\.\.?\/|www\.)/i.test(value)) result.push(value); return; }
    if (typeof value !== "object") return;
    const item = value as Record<string, unknown>;
    const mediaUrl = urlKeys.map((key) => item[key]).find((entry): entry is string => typeof entry === "string" && /^(https?:|blob:|data:image\/|\/|\.\.?\/|www\.)/i.test(entry));
    if (mediaUrl) { result.push({ ...item, url: mediaUrl }); return; }
    Object.entries(item).forEach(([key, nested]) => visit(nested, inMedia || mediaKeys.has(key)));
  };
  if (post) Object.entries(post).forEach(([key, value]) => { if (mediaKeys.has(key)) visit(value, true); });
  return result.filter((item, index, all) => {
    const value = typeof item === "string" ? item : (item as { url?: string }).url;
    return all.findIndex((candidate) => (typeof candidate === "string" ? candidate : (candidate as { url?: string }).url) === value) === index;
  });
}
function unwrapPostResponse(value: unknown): Record<string, unknown> | undefined {
  let current = value;
  for (let depth = 0; depth < 6; depth += 1) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    const record = current as Record<string, unknown>;
    if (record.post && typeof record.post === "object") { current = record.post; continue; }
    if (record.data && typeof record.data === "object") { current = record.data; continue; }
    return record;
  }
  return current && typeof current === "object" && !Array.isArray(current) ? current as Record<string, unknown> : undefined;
}
function isVideoMedia(item: unknown, url: string) {
  const type = typeof item === "object" && item ? String((item as { type?: unknown; mimeType?: unknown; mimetype?: unknown }).type ?? (item as { mimeType?: unknown }).mimeType ?? (item as { mimetype?: unknown }).mimetype ?? "") : "";
  return type.toLowerCase().includes("video") || /\.(mp4|webm|mov|m4v|ogg)(?:[?#]|$)/i.test(url);
}
function errorText(error: unknown): string { const value = error as { data?: { message?: string }; message?: string }; return value?.data?.message || value?.message || "The request failed. Please try again."; }
function StateBox({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div className={`my-4 rounded-xl border px-4 py-6 text-center text-sm ${error ? "border-red-400/20 bg-red-400/[0.04] text-red-200" : "border-white/[0.07] bg-white/[0.02] text-[#9aa4b2]"}`}>{children}</div>; }
function Info({ label: title, value }: { label: string; value: string }) { return <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7f8998]">{title}</p><p className="mt-1 break-words text-sm leading-6 text-[#e2e7ee]">{value}</p></div>; }
function PageButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) { return <button disabled={disabled} onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#dce2ea] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40">{children}</button>; }
