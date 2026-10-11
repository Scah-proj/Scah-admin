import { baseApi } from "./baseurl";

export const chatMonitoringApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatMonitoring: builder.query({
      query: ({ page = 1, limit = 50, search } = {}) => ({
        url: "/api/chat/monitoring",
        method: "GET",
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      }),
      transformResponse: (response, _meta, request) => {
        const conversations = response.data?.conversations;
        if (!Array.isArray(conversations)) {
          throw new Error(
            response?.message ||
              "The chat monitoring response did not include a conversation list.",
          );
        }

        const pagination = response.data?.pagination ?? {};
        const currentPage = pagination.page ?? request.page;
        const pageSize = pagination.limit ?? request.limit;
        const total = pagination.total ?? conversations.length;
        const totalPages =
          pagination.pages ?? Math.max(1, Math.ceil(total / pageSize));

        return {
          conversations,
          pagination: { page: currentPage, limit: pageSize, total, pages: totalPages },
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetChatMonitoringQuery } = chatMonitoringApi;
