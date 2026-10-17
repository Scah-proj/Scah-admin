import { baseApi } from "./baseurl";

export const userStatsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserStats: builder.query({
      query: () => ({ url: "/api/users/stats", method: "GET" }),
      transformResponse: (response) => {
        const stats = response?.data ?? response;
        if (!stats || typeof stats !== "object") {
          throw new Error(response?.message || "The user statistics response was invalid.");
        }
        return stats;
      },
      providesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUserStatsQuery } = userStatsApi;
