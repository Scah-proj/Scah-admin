import { baseApi } from "./baseurl";

const unwrap = (response) => response?.data ?? response;

export const adminReportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminReports: builder.query({
      query: ({ status = "pending", page = 1, limit = 20 }) => ({
        url: "/api/settings/admin/reports",
        method: "GET",
        params: { status, page, limit },
      }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getReportedAccountProfile: builder.query({
      query: (userId) => ({ url: `/api/profile/${encodeURIComponent(userId)}`, method: "GET" }),
      transformResponse: unwrap,
      providesTags: (_result, _error, userId) => [{ type: "ReportedAccounts", id: userId }],
    }),
    getReportedAccountPosts: builder.query({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/api/feed/profile/${encodeURIComponent(userId)}`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: unwrap,
      providesTags: (_result, _error, { userId }) => [{ type: "ReportedAccounts", id: userId }],
    }),
    resolveAdminReport: builder.mutation({
      query: ({ reportId, status, resolutionNote }) => ({
        url: `/api/settings/admin/reports/${encodeURIComponent(reportId)}`,
        method: "PATCH",
        body: { status, ...(resolutionNote?.trim() ? { resolutionNote: resolutionNote.trim() } : {}) },
      }),
      invalidatesTags: ["Reports"],
    }),
    banReportedAccount: builder.mutation({
      query: ({ userId, reason, days }) => ({
        url: `/api/settings/ban/${encodeURIComponent(userId)}`,
        method: "POST",
        body: { reason: reason.trim(), ...(days ? { days } : {}) },
      }),
      invalidatesTags: (_result, _error, { userId }) => ["Reports", { type: "ReportedAccounts", id: userId }],
    }),
    unbanReportedAccount: builder.mutation({
      query: (userId) => ({ url: `/api/settings/unban/${encodeURIComponent(userId)}`, method: "POST" }),
      invalidatesTags: (_result, _error, userId) => ["Reports", { type: "ReportedAccounts", id: userId }],
    }),
  }),
});

export const {
  useGetAdminReportsQuery,
  useGetReportedAccountProfileQuery,
  useGetReportedAccountPostsQuery,
  useResolveAdminReportMutation,
  useBanReportedAccountMutation,
  useUnbanReportedAccountMutation,
} = adminReportsApi;
