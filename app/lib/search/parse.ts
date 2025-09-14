export function parseQuery(query: string): {
  searchTerm: string;
  filters: Record<string, string[]>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} {
  const searchTerm = query.trim();
  const filters: Record<string, string[]> = {};
  let sortBy: string | undefined;
  let sortOrder: 'asc' | 'desc' = 'asc';

  // Simple parsing - in a real app you'd want more sophisticated parsing
  if (searchTerm.includes('sort:')) {
    const sortMatch = searchTerm.match(/sort:(\w+)(?:\s+(asc|desc))?/);
    if (sortMatch) {
      sortBy = sortMatch[1];
      sortOrder = (sortMatch[2] as 'asc' | 'desc') || 'asc';
    }
  }

  return {
    searchTerm: searchTerm.replace(/sort:\w+(?:\s+(asc|desc))?/g, '').trim(),
    filters,
    sortBy,
    sortOrder,
  };
}
