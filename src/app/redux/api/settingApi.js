import { baseApi } from "../../redux/api/baseurl";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
   
    // GET /api/settings/search?q=
    searchSettings: builder.query({
      query: (q = "") => ({
        url: `/api/settings/search?q=${encodeURIComponent(q)}`,
        method: "GET",
      }),
    }),

   

    // GET /api/settings/account
    getAccountSettings: builder.query({
      query: () => ({
        url: "/api/settings/account",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    // PATCH /api/settings/account/password
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/api/settings/account/password",
        method: "PATCH",
        body: data,
      }),
    }),

   

    // POST /api/settings/two-factor/enable
    enableTwoFactor: builder.mutation({
      query: (data) => ({
        url: "/api/settings/two-factor/enable",
        method: "POST",
        body: data, // e.g. { method: "email" }
      }),
    }),

    // POST /api/settings/two-factor/verify
    verifyTwoFactor: builder.mutation({
      query: (data) => ({
        url: "/api/settings/two-factor/verify",
        method: "POST",
        body: data, 
      }),
      invalidatesTags: ["Settings"],
    }),

    // POST /api/settings/two-factor/disable
    disableTwoFactor: builder.mutation({
      query: () => ({
        url: "/api/settings/two-factor/disable",
        method: "POST",
      }),
      invalidatesTags: ["Settings"],
    }),

    // ─────────────────────────────────────────────────────────────────────────
    // Privacy
    // ─────────────────────────────────────────────────────────────────────────

    // GET /api/settings/privacy
    getPrivacySettings: builder.query({
      query: () => ({
        url: "/api/settings/privacy",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    // PATCH /api/settings/privacy — accepts any subset of fields
    // (was /api/settings/account/privacy — that route still works per your
    // routes file, but it's explicitly marked "(legacy)" there, so new code
    // should hit the current path instead)
    updatePrivacySettings: builder.mutation({
      query: (data) => ({
        url: "/api/settings/privacy",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // ─────────────────────────────────────────────────────────────────────────
    // Notifications
    // ─────────────────────────────────────────────────────────────────────────

    // GET /api/settings/notifications
    getNotificationSettings: builder.query({
      query: () => ({
        url: "/api/settings/notifications",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    // PATCH /api/settings/notifications — accepts any subset, flat or nested
    updateNotificationSettings: builder.mutation({
      query: (data) => ({
        url: "/api/settings/notifications",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),

    // ─────────────────────────────────────────────────────────────────────────
    // Logged-in devices / sessions
    // ─────────────────────────────────────────────────────────────────────────

    // GET /api/settings/sessions
    getSessions: builder.query({
      query: () => ({
        url: "/api/settings/sessions",
        method: "GET",
      }),
      providesTags: ["Sessions"],
    }),

    // DELETE /api/settings/sessions/:sessionId — revoke one device
    revokeSession: builder.mutation({
      query: (sessionId) => ({
        url: `/api/settings/sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sessions"],
    }),

    // DELETE /api/settings/sessions — revoke all other devices
    revokeAllOtherSessions: builder.mutation({
      query: () => ({
        url: "/api/settings/sessions",
        method: "DELETE",
      }),
      invalidatesTags: ["Sessions"],
    }),

    // ─────────────────────────────────────────────────────────────────────────
    // Danger Zone
    // ─────────────────────────────────────────────────────────────────────────

    // POST /api/settings/deactivate — reversible on next login
    deactivateAccount: builder.mutation({
      query: () => ({
        url: "/api/settings/deactivate",
        method: "POST",
      }),
      invalidatesTags: ["Settings"],
    }),

    // DELETE /api/settings/account — permanent soft-delete
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/api/settings/account",
        method: "DELETE",
      }),
      invalidatesTags: ["Settings"],
    }),
  }),

  overrideExisting: process.env.NODE_ENV === "development",
});

export const {
  useSearchSettingsQuery,
  useGetAccountSettingsQuery,
  useChangePasswordMutation,
  useEnableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useDisableTwoFactorMutation,
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllOtherSessionsMutation,
  useDeactivateAccountMutation,
  useDeleteAccountMutation,
} = settingsApi;