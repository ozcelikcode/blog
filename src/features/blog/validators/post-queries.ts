import { z } from "zod";

const pageSchema = z.coerce.number().int().min(1).catch(1);
const searchQuerySchema = z.string().trim().min(1).max(100).catch("");

export function parsePageQuery(searchParams: URLSearchParams): number {
  return pageSchema.parse(searchParams.get("page"));
}

export function parseSearchQuery(searchParams: URLSearchParams): { page: number; query: string | null } {
  const query = searchQuerySchema.parse(searchParams.get("q"));

  return {
    page: parsePageQuery(searchParams),
    query: query.length > 0 ? query : null,
  };
}
