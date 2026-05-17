import { jsonError, jsonOk } from "@/lib/api";
import { rejectCoach } from "@/lib/marketplace";
import { getRequestUser } from "@/lib/request-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const actor = getRequestUser(request.headers, "admin");
    const body = await request.json().catch(() => ({}));
    const coach = await rejectCoach(id, actor!, body.reason);

    return jsonOk({ coach });
  } catch (error) {
    return jsonError(error);
  }
}
