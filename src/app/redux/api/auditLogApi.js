import { baseApi } from "./baseurl";

export const auditLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: ({ page, limit, ...filters }) => ({
        url: "/api/audit-logs",
        method: "GET",
        params: { page, limit, ...filters },
      }),
      transformResponse: (response, _meta, request) => {
        if (typeof response === "string") {
          throw new Error(
            `The audit-log endpoint returned "${response}". Verify that the backend route is enabled and available to this admin account.`,
          );
        }

        const logs =
          response.data?.events ??
          response.data?.auditLogs ??
          response.data?.logs ??
          response.auditLogs ??
          response.logs ??
          (Array.isArray(response.data) ? response.data : undefined);
        if (!Array.isArray(logs)) {
          throw new Error(
            response?.message ||
              "The audit log response did not include an event list.",
          );
        }

        const pagination =
          response.data?.pagination ?? response.pagination ?? {};
        const totalResults =
          pagination.totalResults ?? pagination.total ?? logs.length;
        const currentPage =
          pagination.currentPage ?? pagination.page ?? request.page;
        const totalPages =
          pagination.totalPages ??
          pagination.pages ??
          Math.max(1, Math.ceil(totalResults / request.limit));

        return {
          logs,
          pagination: { currentPage, totalPages, totalResults },
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetAuditLogsQuery } = auditLogApi;
