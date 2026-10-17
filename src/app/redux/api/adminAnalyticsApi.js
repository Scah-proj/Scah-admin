import { baseApi } from "./baseurl";

export const adminAnalyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminAnalytics: builder.query({
      query: (days = 30) => ({
        url: "/api/settings/admin/analytics",
        method: "GET",
        params: { days },
      }),
      transformResponse: (response) => {
        const payload = response?.data?.data ?? response?.data ?? response;
        if (!Array.isArray(payload?.daily)) {
          throw new Error(response?.message || "The analytics response did not include daily data.");
        }
        return {
          daily: payload.daily,
          totals: payload.totals ?? {},
        };
      },
      providesTags: ["AdminAnalytics"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminAnalyticsQuery } = adminAnalyticsApi;
