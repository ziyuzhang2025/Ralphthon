import { jsonError, jsonOk } from "@/lib/api";
import { getOpenAvailability, listApprovedCoaches } from "@/lib/marketplace";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const specialty = url.searchParams.get("specialty") ?? undefined;
    const query = url.searchParams.get("q") ?? undefined;
    const coaches = (await listApprovedCoaches({ specialty, query })).map((coach) => ({
      ...coach,
      availability: getOpenAvailability(coach.id).slice(0, 3),
    }));

    return jsonOk({ coaches });
  } catch (error) {
    return jsonError(error);
  }
}
