import { baseApi } from "../../redux/api/baseurl";

export const storyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Story
    createStory: builder.mutation({
      query: (storyData) =>
      {
        const formData = new FormData();

        formData.append("mediaType", storyData.mediaType);
        formData.append("caption", storyData.caption);

        if (storyData.media)
        {
          formData.append("media", storyData.media);
        }

        // Text-story styling fields — these were previously never
        // appended, so the backend always fell back to its defaults
        // (#000000 / #FFFFFF) regardless of what the user picked.
        if (storyData.backgroundColor)
        {
          formData.append("backgroundColor", storyData.backgroundColor);
        }
        if (storyData.textColor)
        {
          formData.append("textColor", storyData.textColor);
        }
        if (storyData.fontStyle)
        {
          formData.append("fontStyle", storyData.fontStyle);
        }
        if (storyData.duration)
        {
          formData.append("duration", storyData.duration);
        }

        return {
          url: "/api/stories",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Story"],
    }),

    // Get all stories (Story feed)
    getFeedStories: builder.query({
      query: () => ({
        url: "/api/stories",
        method: "GET",
      }),
      providesTags: ["Story"],
    }),

    // Get stories for one user
    getUserStories: builder.query({
      query: (userId) => ({
        url: `/api/stories/user/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [
        { type: "Story", id: userId },
      ],
    }),

    // Get archived stories (Paginated). Cache-tagged per page so loading
    // page 2 doesn't refetch page 1, but any story mutation (create/delete/
    // archive) still invalidates the whole list via the bare "Story" tag.
    getArchivedStories: builder.query({
      query: (params) => ({
        url: "/api/stories/archived",
        method: "GET",
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      }),
      providesTags: (result, error, params) => [
        { type: "Story", id: `ARCHIVE-${params?.page || 1}` },
        "Story",
      ],
    }),

    // Permanently delete an archived story replica (hard delete on the
    // backend, including storage cleanup). Distinct from deleteStory,
    // which only soft-deletes an active (non-archived) story.
    deleteArchivedStory: builder.mutation({
      query: (storyId) => ({
        url: `/api/stories/archived/${storyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Story"],
    }),

    // View Story
    viewStory: builder.mutation({
      query: (storyId) => ({
        url: `/api/stories/${storyId}/view`,
        method: "POST",
      }),
      invalidatesTags: ["Story"],
    }),


    archiveStory: builder.mutation({
      query: (storyId) => ({
        url: `/api/stories/${storyId}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: ["Story"],
    }),

    // Delete Story
    deleteStory: builder.mutation({
      query: (storyId) => ({
        url: `/api/stories/${storyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Story"],
    }),

    // Mute a user's stories — hides their stories from getFeedStories
    // until unmuted. Does not affect direct profile story viewing.
    muteStory: builder.mutation({
      query: (userId) => ({
        url: "/api/stories/mute",
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: ["Story"],
    }),

    // Unmute a previously muted user's stories
    unmuteStory: builder.mutation({
      query: (userId) => ({
        url: "/api/stories/unmute",
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: ["Story"],
    }),

    // Get the list of users whose stories the current user has muted
    getMutedStories: builder.query({
      query: () => ({
        url: "/api/stories/muted",
        method: "GET",
      }),
      providesTags: ["Story"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useCreateStoryMutation,
  useGetFeedStoriesQuery,
  useGetUserStoriesQuery,
  useGetArchivedStoriesQuery,
  useDeleteArchivedStoryMutation,
  useViewStoryMutation,
  useArchiveStoryMutation,
  useDeleteStoryMutation,
  useMuteStoryMutation,
  useUnmuteStoryMutation,
  useGetMutedStoriesQuery,
} = storyApi;