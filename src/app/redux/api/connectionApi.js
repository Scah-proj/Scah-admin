import { baseApi } from "../../redux/api/baseurl";

export const connectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Follow User
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/api/connections/${userId}/follow`,
        method: "POST",
      }),
      invalidatesTags: ["Connection", "Notification"],
    }),

    // Unfollow User
    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/api/connections/${userId}/unfollow`,
        method: "DELETE", // Changed to DELETE to match standard REST conventions
      }),
      invalidatesTags: ["Connection", "Notification"],
    }),

    // Get Connection Status
    getConnectionStatus: builder.query({
      query: (userId) => ({
        url: `/api/connections/${userId}/connection-status`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Connection", id: `status-${userId}` },
      ],
    }),

    // Get Connection Counts
    getConnectionCounts: builder.query({
      query: (userId) => ({
        url: `/api/connections/${userId}/counts`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Connection", id: `counts-${userId}` },
      ],
    }),

    // Get Suggestions
    getSuggestions: builder.query({
      query: () => ({
        url: "/api/connections/suggestions",
        method: "GET",
      }),
      providesTags: ["Connection"],
    }),

    // Get My Mutuals (Users who follow me and I follow back)
    getMutuals: builder.query({
      query: () => ({
        url: "/api/connections/mutuals",
        method: "GET",
      }),
      providesTags: ["Connection"],
    }),

    // Get Mutual Followers with another specific user
    getMutualFollowers: builder.query({
      query: (userId) => ({
        url: `/api/connections/${userId}/mutual`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Connection", id: `mutual-${userId}` },
      ],
    }),

    // Get Followers
    getFollowers: builder.query({
      query: (userId) => ({
        url: `/api/connections/${userId}/followers`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Connection", id: `followers-${userId}` },
      ],
    }),

    // Get Following
    getFollowing: builder.query({
      query: (userId) => ({
        url: `/api/connections/${userId}/following`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Connection", id: `following-${userId}` },
      ],
    }),

    // Get Notifications
    getNotifications: builder.query({
      query: () => ({
        url: "/api/connections/notifications",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    // Get Unread Notification Count
    getUnreadNotificationCount: builder.query({
      query: () => ({
        url: "/api/connections/notifications/unread/count",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    // Mark All Notifications as Read
    readAllNotifications: builder.mutation({
      query: () => ({
        url: "/api/connections/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Delete All Notifications
    deleteAllNotifications: builder.mutation({
      query: () => ({
        url: "/api/connections/notifications",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
    getNotificationSettings: builder.query({
      query: () => ({
        url: "/api/connections/notifications/settings",
        method: "GET",
      }),
      providesTags: ["NotificationSettings"],
    }),

    // Update Notification Settings (bulk/general update)
    updateNotificationSettings: builder.mutation({
      query: (settings) => ({
        url: "/api/connections/notifications/settings",
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["NotificationSettings"],
    }),
    // Get My Followers
    getMyFollowers: builder.query({
      query: () => ({
        url: "/api/connections/me/followers",
        method: "GET",
      }),
      providesTags: [{ type: "Connection", id: "my-followers" }],
    }),

    // Get My Following
    getMyFollowing: builder.query({
      query: () => ({
        url: "/api/connections/me/following",
        method: "GET",
      }),
      providesTags: [{ type: "Connection", id: "my-following" }],
    }),

    // Toggle Pause All Notifications
    togglePauseAllNotifications: builder.mutation({
      query: (pauseAll) => ({
        url: "/api/connections/notifications/settings/pause-all",
        method: "PATCH",
        body: { pauseAll },
      }),
      invalidatesTags: ["NotificationSettings"],
    }),

    // Toggle Sleep Mode Notifications
    toggleSleepModeNotifications: builder.mutation({
      query: (sleepMode) => ({
        url: "/api/connections/notifications/settings/sleep-mode",
        method: "PATCH",
        body: { sleepMode },
      }),
      invalidatesTags: ["NotificationSettings"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetConnectionStatusQuery,
  useGetConnectionCountsQuery,
  useGetSuggestionsQuery,
  useGetMutualsQuery,
  useGetMutualFollowersQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetMyFollowersQuery,
  useGetMyFollowingQuery,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useReadAllNotificationsMutation,
  useDeleteAllNotificationsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useTogglePauseAllNotificationsMutation,
  useToggleSleepModeNotificationsMutation,
} = connectionApi;