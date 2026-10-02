import { baseApi } from "./baseurl";

export const scoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllScouts: builder.query({
      query: ({ page = 1, limit } = {}) => ({
        url: "/api/scouts",
        method: "GET",
        params: limit ? { page, limit } : undefined,
      }),
      transformResponse: (response) => {
        const scouts = response.data?.scouts;
        if (!Array.isArray(scouts)) {
          throw new Error(response.message || "The scouts response was invalid.");
        }
        return {
          scouts,
          total:
            response.data?.pagination?.totalResults ?? scouts.length,
        };
      },
      providesTags: ["Scouts"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllScoutsQuery } = scoutApi;
