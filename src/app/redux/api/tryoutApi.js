import { baseApi } from "../../redux/api/baseurl";

export const tryoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tryouts
    getTryouts: builder.query({
      query: () => ({
        url: "/api/tryout",
        method: "GET",
      }),
      providesTags: ["Tryout"],
    }),

   
    getMyTryouts: builder.query({
      query: () => ({
        url: "/api/tryout/my",
        method: "GET",
      }),
      providesTags: ["Tryout"],
    }),

    // Search tryouts
    searchTryouts: builder.query({
      query: ({ q = "", sport = "" }) => ({
        url: `/api/tryout/search?q=${encodeURIComponent(q)}&sport=${encodeURIComponent(sport)}`,
        method: "GET",
      }),
      providesTags: ["Tryout"],
    }),

    // Get tryout by ID
    getTryoutById: builder.query({
      query: (id) => ({
        url: `/api/tryout/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        const t = response.data;
        return {
          ...t,
          eligibility: {
            ageRange: t.ageRange,
            positions: t.positions ?? [],
            gender: t.gender,
            experience: t.experience ?? "Not specified",
          },
        };
      },
      providesTags: (result, error, id) => [
        { type: "Tryout", id },
      ],
    }),
      // Get the latest tryout
getLatestTryout: builder.query({
  query: () => ({
    url: "/api/tryout/latest",
    method: "GET",
  }),
  transformResponse: (response) => response.data,
  providesTags: ["Tryout"],
}),
    // Create tryout
    createTryout: builder.mutation({
      query: (data) => ({
        url: "/api/tryout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tryout"],
    }),

    // Update tryout
    updateTryout: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/tryout/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tryout", id },
        "Tryout",
      ],
    }),

    // Delete tryout
    deleteTryout: builder.mutation({
      query: (id) => ({
        url: `/api/tryout/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tryout"],
    }),

    // Apply to a tryout (athlete)
    applyToTryout: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/tryout/${id}/apply`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Tryout", id },
        "TryoutApplicants",
        "Notification",
      ],
    }),

    // Withdraw application (athlete)
    withdrawApplication: builder.mutation({
      query: (id) => ({
        url: `/api/tryout/${id}/apply`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Tryout", id },
        "TryoutApplicants",
      ],
    }),

    // Get applicants for a tryout (scout)
    getTryoutApplicants: builder.query({
  query: (id) => ({
    url: `/api/tryout/${id}/applicants`,
    method: "GET",
  }),
  providesTags: (result, error, id) => [
    { type: "TryoutApplicants", id },
    "TryoutApplicants",
  ],
}),

    // Accept/reject an applicant (scout)
    updateApplicationStatus: builder.mutation({
      query: ({ id, applicationId, status, feedback }) => ({
        url: `/api/tryout/${id}/applicants/${applicationId}`,
        method: "PATCH",
        body: { status, feedback },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "TryoutApplicants", id },
        "TryoutApplicants",
        "Notification",
      ],
    }),

    // Toggle save/unsave a tryout — mirrors post save behaviour
    toggleSaveTryout: builder.mutation({
      query: (id) => ({
        url: `/api/tryout/${id}/save`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Tryout", id },
        "Tryout",
      ],
    }),

    // Get all tryouts saved by the current user
    getSavedTryouts: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/api/tryout/saved?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Tryout"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetTryoutsQuery,
  useGetMyTryoutsQuery,
  useSearchTryoutsQuery,
  useGetTryoutByIdQuery,
  useGetLatestTryoutQuery,
  useCreateTryoutMutation,
  useUpdateTryoutMutation,
  useDeleteTryoutMutation,
  useApplyToTryoutMutation,
  useWithdrawApplicationMutation,
  useGetTryoutApplicantsQuery,
  useUpdateApplicationStatusMutation,
  useToggleSaveTryoutMutation,
  useGetSavedTryoutsQuery,
} = tryoutApi;