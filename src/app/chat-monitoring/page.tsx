"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";
import { useGetChatMonitoringQuery } from "@/app/redux/api/chatMonitoringApi";

const PAGE_SIZE = 50;

type Participant = {
  userId?: string | null;
  name?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  user?: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

type Conversation = {
  conversationId?: string;
  _id?: string;
  id?: string;
  participantsLabel?: string;
  participants?: Array<Participant | string>;
  type?: string;
  chatType?: string;
  messageCount?: number;
  messagesCount?: number;
  status?: string;
  lastActivity?: string | null;
  lastActivityAt?: string | null;
  updatedAt?: string | null;
};

export default function ChatMonitoringPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const {
    currentData,
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetChatMonitoringQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  const conversations: Conversation[] = currentData?.conversations ?? [];
  const pagination = currentData?.pagination;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.pages ?? 1;
  const total = pagination?.total ?? conversations.length;
  const errorMessage = isError ? getErrorMessage(error) : null;
  const isLoadingCurrentPage = isLoading || (isFetching && !currentData);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7ddc5a]">
            Safety &amp; oversight
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Chat monitoring
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a3acba]">
            View conversation participants and activity metadata. Message text
            and attachments are not available in this view.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-semibold text-[#e5e9ef] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <div
        role="note"
        className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm leading-6 text-[#a3acba]"
      >
        Conversation status reflects the backend’s current status only.{" "}
        <span className="font-semibold text-[#d0d5dc]">Normal</span> is the
        default status; it does not mean messages have been reviewed or
        moderated.
      </div>

      <section
        aria-label="Conversation summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <SummaryCard
          icon={<MessageCircle size={18} />}
          label="Matching conversations"
          value={isLoadingCurrentPage ? "…" : errorMessage ? "—" : total}
          color="text-[#7ddc5a]"
        />
        <SummaryCard
          icon={<UsersRound size={18} />}
          label="Conversations on this page"
          value={
            isLoadingCurrentPage ? "…" : errorMessage ? "—" : conversations.length
          }
          color="text-[#b8c5d9]"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11151b] shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-bold text-white">Conversations</h2>
            <p className="mt-1 text-xs text-[#8e98a7]">
              {isLoadingCurrentPage
                ? "Loading conversations…"
                : errorMessage
                  ? "Unable to load conversations"
                  : `${conversations.length} on this page · ${total} total`}
            </p>
          </div>

          <form
            onSubmit={submitSearch}
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
          >
            <label className="relative block sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8792a1]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search participant name or email"
                aria-label="Search participant name or email"
                className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#0b0e12] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-[#76808e] focus:border-[#7ddc5a]/60 focus:ring-2 focus:ring-[#7ddc5a]/10"
              />
            </label>
            <button
              type="submit"
              disabled={isFetching}
              className="h-10 rounded-xl bg-[#7ddc5a] px-4 text-sm font-bold text-[#0b1220] transition hover:bg-[#69c94b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Search
            </button>
          </form>
        </div>

        {errorMessage ? (
          <div role="alert" className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#ff927f]">
              {getErrorTitle(error)}
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#a3acba]">
              {errorMessage}
            </p>
          </div>
        ) : isLoadingCurrentPage ? (
          <div
            role="status"
            className="px-5 py-12 text-center text-sm text-[#a3acba]"
          >
            Loading conversations…
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-semibold text-[#d3d9e2]">
              {search ? "No matching conversations" : "No conversations found"}
            </p>
            <p className="mt-1 text-xs text-[#8792a1]">
              {search
                ? "Try another participant name or email."
                : "Conversations will appear here when available."}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] font-bold uppercase tracking-[0.12em] text-[#778291]">
                    <th scope="col" className="px-5 py-3.5">Participants</th>
                    <th scope="col" className="px-5 py-3.5">Type</th>
                    <th scope="col" className="px-5 py-3.5">Messages</th>
                    <th scope="col" className="px-5 py-3.5">Status</th>
                    <th scope="col" className="px-5 py-3.5">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.055]">
                  {conversations.map((conversation, index) => (
                    <ConversationRow
                      key={
                        conversation.conversationId ??
                        conversation._id ??
                        conversation.id ??
                        index
                      }
                      conversation={conversation}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-white/[0.055] md:hidden">
              {conversations.map((conversation, index) => (
                <ConversationCard
                  key={
                    conversation.conversationId ??
                    conversation._id ??
                    conversation.id ??
                    index
                  }
                  conversation={conversation}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#8792a1]">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage <= 1 || isFetching}
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
                  disabled={currentPage >= totalPages || isFetching}
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

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const participants =
    conversation.participantsLabel?.trim() ||
    getParticipantNames(conversation.participants).join(", ");
  const messageCount =
    conversation.messageCount ?? conversation.messagesCount ?? 0;
  const status = conversation.status?.trim() || "unknown";

  return (
    <tr className="transition-colors hover:bg-white/[0.025]">
      <td className="max-w-[360px] px-5 py-4">
        <p className="text-sm font-semibold text-[#e7ebf0]">
          {participants || "Participants unavailable"}
        </p>
      </td>
      <td className="px-5 py-4 text-sm text-[#c3cad4]">
        {formatConversationType(conversation.type ?? conversation.chatType)}
      </td>
      <td className="px-5 py-4 text-sm tabular-nums text-[#c3cad4]">
        {messageCount}
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-[#a3acba]">
        {formatDate(conversation.lastActivityAt ?? conversation.lastActivity ?? conversation.updatedAt)}
      </td>
    </tr>
  );
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const participants =
    conversation.participantsLabel?.trim() ||
    getParticipantNames(conversation.participants).join(", ");
  const messageCount =
    conversation.messageCount ?? conversation.messagesCount ?? 0;
  const status = conversation.status?.trim() || "unknown";

  return (
    <article className="space-y-4 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-[#e7ebf0]">
            {participants || "Participants unavailable"}
          </p>
          <p className="mt-1 text-xs text-[#8792a1]">
            {formatConversationType(conversation.type ?? conversation.chatType)}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-[#a3acba]">
        <span>{messageCount} messages</span>
        <time>
          {formatDate(conversation.lastActivityAt ?? conversation.lastActivity ?? conversation.updatedAt)}
        </time>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isNormal = status.toLowerCase() === "normal";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        isNormal
          ? "bg-white/[0.07] text-[#c3cad4]"
          : "bg-[#f3b95f]/[0.1] text-[#f3d293]"
      }`}
      title="Current backend status only; this does not indicate moderation."
    >
      {status}
    </span>
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

function getParticipantNames(participants?: Conversation["participants"]) {
  if (!Array.isArray(participants)) return [];

  return participants
    .map((participant) => {
      if (typeof participant === "string") return participant;

      const person = participant.user ?? participant;
      const fullName =
        participant.name?.trim() ||
        person.name?.trim() ||
        participant.fullName?.trim() ||
        [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
      return fullName || person.email?.trim() || "";
    })
    .filter(Boolean);
}

function formatConversationType(type?: string) {
  if (!type) return "Conversation";
  const normalized = type.toLowerCase().replace(/[\s_-]+/g, "");

  if (["direct", "dm", "directmessage", "private"].includes(normalized)) {
    return "Direct Message";
  }
  if (["group", "groupchat"].includes(normalized)) return "Group Chat";
  return type.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getErrorTitle(error: unknown) {
  const status =
    error && typeof error === "object" && "status" in error
      ? error.status
      : undefined;
  if (status === 403) return "Access denied";
  if (status === 401) return "Session expired or invalid";
  return "Could not load conversations";
}

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unexpected error occurred while loading conversations.";
  }

  const apiError = error as {
    status?: number | string;
    error?: string;
    message?: string;
    data?: { message?: string; error?: { message?: string } | string };
  };

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
    return "Your account does not have permission to view chat monitoring.";
  }
  if (apiError.status === 401) {
    return "Your session is expired or invalid. Sign in again to continue.";
  }
  if (typeof apiError.message === "string" && apiError.message !== "Rejected") {
    return apiError.message;
  }
  return (
    apiError.error ||
    "An unexpected error occurred while loading conversations."
  );
}
