import { baseApi } from "../../redux/api/baseurl";

export const feedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation({
      query: (postData) =>
      {
        const formData = new FormData();

        formData.append("caption", postData.caption);
        formData.append("type", postData.type);
        formData.append("sport", postData.sport);

        if (postData.tags)
        {
          formData.append("tags", postData.tags);
        }

        if (postData.taggedUsers?.length)
        {
          formData.append("tagged_users", postData.taggedUsers.join(","));
        }

        if (postData.location)
        {
          formData.append(
            "location",
            JSON.stringify(postData.location)
          );
        }

        postData.media?.forEach((file) =>
        {
          formData.append("media", file);
        });

        return {
          url: "/api/feed",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Feed"],
    }),

    getHomeFeed: builder.query({
      query: () => ({
        url: "/api/feed/home",
        method: "GET",
      }),
      providesTags: ["Feed"],
    }),

    getDiscoverFeed: builder.query({
      query: () => ({
        url: "/api/feed/discover",
        method: "GET",
      }),
      providesTags: ["Feed"],
    }),

    getTrendingPosts: builder.query({
      query: () => ({
        url: "/api/feed/trending",
        method: "GET",
      }),
      providesTags: ["Feed"],
    }),

    getMyPosts: builder.query({
      query: () => ({
        url: "/api/feed/my-posts",
        method: "GET",
      }),
      providesTags: ["Feed"],
    }),

    getProfileFeed: builder.query({
      query: (userId) => ({
        url: `/api/feed/profile/${userId}`,
        method: "GET",
      }),
      providesTags: ["Feed"],
    }),

    getSavedPosts: builder.query({
      query: (params) => ({
        url: "/api/feed/saved",
        method: "GET",
        params,
      }),
      providesTags: ["SavedPosts"],
    }),

    getPostById: builder.query({
      query: (postId) => ({
        url: `/api/feed/${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "Feed", id: postId },
      ],
    }),

    getComments: builder.query({
      query: (postId) => ({
        url: `/api/feed/${postId}/comments`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [
        { type: "Comments", id: postId },
      ],
    }),

    addComment: builder.mutation({
      query: ({ postId, content }) => ({
        url: `/api/feed/${postId}/comments`,
        method: "POST",
        body: {
          content,
        },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comments", id: postId },
        { type: "Feed", id: postId },
        "Feed",
      ],
    }),

    toggleLikePost: builder.mutation({
      query: (postId) => ({
        url: `/api/feed/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Feed", id: postId },
        "Feed",
      ],
    }),

    toggleSavePost: builder.mutation({
      query: (postId) => ({
        url: `/api/feed/${postId}/save`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Feed", id: postId },
        "Feed",
        "SavedPosts",
      ],
    }),

    updatePost: builder.mutation({
      query: ({ postId, formData }) => ({
        url: `/api/feed/${postId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Feed"],
    }),

    // Delete (soft-delete) a post
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/api/feed/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Feed", id: postId },
        "Feed",
        "DeletedPosts",
      ],
    }),

    // Fetch soft-deleted posts history
    getDeletedPosts: builder.query({
      query: (params) => ({
        url: "/api/feed/deleted",
        method: "GET",
        params,
      }),
      providesTags: ["DeletedPosts"],
    }),

    // ── Reposts ──────────────────────────────────────────────────────────

    toggleRepost: builder.mutation({
      query: (postId) => ({
        url: `/api/feed/${postId}/repost`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Feed", id: postId },
        "Feed",
        "MyReposts", // Refreshes the user's repost feed when a post is reposted/unreposted
      ],
    }),

    getReposts: builder.query({
      query: ({ postId, page = 1, limit = 20 }) => ({
        url: `/api/feed/${postId}/reposts`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result, error, { postId }) => [
        { type: "Feed", id: `reposts-${postId}` },
      ],
    }),

    getMyReposts: builder.query({
      query: (params) => ({
        url: "/api/feed/reposts/me",
        method: "GET",
        params,
      }),
      providesTags: ["MyReposts"],
    }),

    // ── Archive ──────────────────────────────────────────────────────────

    archivePost: builder.mutation({
      query: (postId) => ({
        url: `/api/feed/${postId}/archive`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Feed", id: postId },
        "Feed",
        "Archived",
      ],
    }),

    getArchivedPosts: builder.query({
      query: (params) => ({
        url: "/api/feed/archived",
        method: "GET",
        params,
      }),
      providesTags: ["Archived"],
    }),

    // ── Comments (remaining) ─────────────────────────────────────────────

    getReplies: builder.query({
      query: ({ commentId, page = 1, limit = 10 }) => ({
        url: `/api/feed/comments/${commentId}/replies`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result, error, { commentId }) => [
        { type: "Comments", id: `replies-${commentId}` },
      ],
    }),

    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/api/feed/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comments", "Feed"],
    }),

    // ── Hashtags ─────────────────────────────────────────────────────────

    getTrendingHashtags: builder.query({
      query: ({ limit = 20, timeframe = 24 } = {}) => ({
        url: "/api/feed/hashtags/trending",
        method: "GET",
        params: { limit, timeframe },
      }),
      providesTags: ["Feed"],
    }),

    searchByHashtag: builder.query({
      query: ({ hashtag, page = 1, limit = 20 }) => ({
        url: `/api/feed/hashtags/${hashtag}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result, error, { hashtag }) => [
        { type: "Feed", id: `hashtag-${hashtag}` },
      ],
    }),
  }),

  
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useCreatePostMutation,
  useGetHomeFeedQuery,
  useGetDiscoverFeedQuery,
  useGetTrendingPostsQuery,
  useGetMyPostsQuery,
  useGetProfileFeedQuery,
  useGetSavedPostsQuery,
  useGetPostByIdQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useToggleLikePostMutation,
  useToggleSavePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetDeletedPostsQuery,
  useToggleRepostMutation,
  useGetRepostsQuery,
  useGetMyRepostsQuery,
  useArchivePostMutation,
  useGetArchivedPostsQuery,
  useGetRepliesQuery,
  useDeleteCommentMutation,
  useGetTrendingHashtagsQuery,
  useSearchByHashtagQuery,
} = feedApi;