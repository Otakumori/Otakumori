export interface ParsedQuery {
  searchTerm: string;
  filters: Record<string, string[]>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function parseQuery(query: string): ParsedQuery {
  const searchTerm = query.trim();
  const filters: Record<string, string[]> = {};
  let sortBy: string | undefined;
  let sortOrder: "asc" | "desc" = "asc";

  if (searchTerm.includes("sort:")) {
    const sortMatch = searchTerm.match(/sort:(\w+)(?:\s+(asc|desc))?/);
    if (sortMatch) {
      sortBy = sortMatch[1];
      sortOrder = (sortMatch[2] as "asc" | "desc") ?? "asc";
    }
  }

  const result: any = {
    searchTerm: searchTerm.replace(/sort:\w+(?:\s+(asc|desc))?/g, '').trim(),
    filters,
    sortOrder,
  };
  if (sortBy !== undefined) result.sortBy = sortBy;
  return result;
}
