const createResponseError = (message) => ({
  status: "CUSTOM_ERROR",
  error: message,
  data: { message },
});

export async function fetchAllPages(baseQuery, url, collectionKey) {
  const firstResult = await baseQuery({ url, params: { page: 1 } });
  if (firstResult.error) return { error: firstResult.error };

  const firstResponse = firstResult.data;
  const firstPage = firstResponse?.data?.[collectionKey];
  if (!Array.isArray(firstPage)) {
    return {
      error: createResponseError(
        firstResponse?.message ||
          `The ${collectionKey} response was invalid.`,
      ),
    };
  }

  const pagination = firstResponse.data.pagination;
  const parsedTotal = Number(pagination?.totalResults);
  const total = Number.isFinite(parsedTotal) ? parsedTotal : firstPage.length;
  const parsedPageSize = Number(pagination?.limit);
  const pageSize =
    Number.isInteger(parsedPageSize) && parsedPageSize > 0
      ? parsedPageSize
      : firstPage.length;
  const parsedTotalPages = Number(pagination?.totalPages);

  if (total > firstPage.length && pageSize === 0) {
    return {
      error: createResponseError(
        `The ${collectionKey} response reported more results without a page size.`,
      ),
    };
  }

  const pageCount = Math.max(
    1,
    Number.isInteger(parsedTotalPages) && parsedTotalPages > 0
      ? parsedTotalPages
      : 1,
    pageSize ? Math.ceil(total / pageSize) : 1,
  );

  const remainingResults = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      baseQuery({ url, params: { page: index + 2 } }),
    ),
  );
  const results = [firstResult, ...remainingResults];
  const items = [];

  for (const result of results) {
    if (result.error) return { error: result.error };

    const page = result.data?.data?.[collectionKey];
    if (!Array.isArray(page)) {
      return {
        error: createResponseError(
          `The ${collectionKey} response was invalid.`,
        ),
      };
    }
    items.push(...page);
  }

  return {
    data: { [collectionKey]: items, total: Math.max(total, items.length), pagination },
  };
}
