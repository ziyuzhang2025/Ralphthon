import { jsonError, jsonOk } from "@/lib/api";
import { getBookingJoinDetails } from "@/lib/marketplace";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const actor = getRequestUser(request.headers, "guardian");
    const details = await getBookingJoinDetails(id, actor!);

    return jsonOk(details);
  } catch (error) {
    return jsonError(error);
  }
}
