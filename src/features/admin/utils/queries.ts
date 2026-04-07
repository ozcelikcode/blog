import { z } from "zod";

const pageSchema = z.coerce.number().int().min(1).catch(1);

export function parseAdminPageQuery(searchParams: URLSearchParams): number {
  return pageSchema.parse(searchParams.get("page"));
}
