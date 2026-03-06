// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

export function useCategoryUrlState() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("-createdAt"));
  const [isArchived, setIsArchived] = useQueryState(
    "isArchived",
    parseAsString.withDefault("false"),
  );

  // Module-specific filters (add as needed)
  // const [color, setColor] = useQueryState("color", parseAsString.withDefault(""));

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    sort,
    setSort,
    isArchived,
    setIsArchived,
    // color, setColor,
  };
}
