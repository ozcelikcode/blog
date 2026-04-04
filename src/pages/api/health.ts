import { getDatabaseHealthReport } from "@/lib/db/health";

export function GET() {
  return Response.json(getDatabaseHealthReport());
}
