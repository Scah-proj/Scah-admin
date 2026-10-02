import { baseApi } from "../../redux/api/baseurl";

export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Scouts recommended for the logged-in athlete
    getRecommendedScouts: builder.query({
      query: (limit) => ({
        url: `/api/recommendations/scouts${limit ? `?limit=${limit}` : ""}`,
        method: "GET",
      }),
      
      providesTags: ["Recommendations"],
    }),

    // Athletes recommended for the logged-in scout
getRecommendedAthletes: builder.query({
  query: (limit) => ({
    url: `/api/recommendations/athletes${limit ? `?limit=${limit}` : ""}`,
    method: "GET",
  }),
  providesTags: ["Recommendations"],
}),
    // Recommended users
    getRecommendedUsers: builder.query({
      query: (limit) => ({
        url: `/api/recommendations/users${limit ? `?limit=${limit}` : ""}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data?.recommendations || [],
      providesTags: ["Recommendations"],
    }),

    // People You May Know
    getPeopleYouMayKnow: builder.query({
      query: (paramsObj = {}) => {
        const { page = 1, limit = 20, sport, role } = paramsObj || {};

        const params = { page, limit };
        if (sport) params.sport = sport;
        if (role) params.role = role;

        return {
          url: "api/recommendations/people-you-may-know",
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => response?.data?.suggestions || [],
      providesTags: ["Recommendations"],
    }),

    // Dismiss a suggested user
    dismissSuggestion: builder.mutation({
      query: (dismissedUserId) => ({
        url: `/api/recommendations/people-you-may-know/${dismissedUserId}/dismiss`,
        method: "POST",
      }),
      invalidatesTags: ["Recommendations"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetRecommendedScoutsQuery,
  useGetRecommendedAthletesQuery,
  useGetRecommendedUsersQuery,
  useGetPeopleYouMayKnowQuery,
  useDismissSuggestionMutation,
} = recommendationApi;