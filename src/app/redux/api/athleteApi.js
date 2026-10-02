import { baseApi } from "./baseurl";
import { fetchAllPages } from "./fetchAllPages";

export const athleteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAthletes: builder.query({
      query: ({ page = 1, limit, search } = {}) => ({
        url: "/api/athletes",
        method: "GET",
        params: {
          page,
          ...(limit ? { limit } : {}),
          ...(search ? { search } : {}),
        },
      }),
      transformResponse: (response) => {
        const athletes = response.data?.athletes;
        if (!Array.isArray(athletes)) {
          throw new Error(response.message || "The athletes response was invalid.");
        }
        return {
          athletes,
          total: response.data?.pagination?.totalResults ?? athletes.length,
          pagination: response.data?.pagination,
        };
      },
      providesTags: ["Athletes"],
    }),
    getAllRegistrationAthletes: builder.query({
      queryFn: (_arg, _api, _extraOptions, baseQuery) =>
        fetchAllPages(baseQuery, "/api/athletes", "athletes"),
      providesTags: ["Athletes"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllAthletesQuery,
  useGetAllRegistrationAthletesQuery,
} = athleteApi;
