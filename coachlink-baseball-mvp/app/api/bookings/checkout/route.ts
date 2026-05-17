import { jsonError, jsonOk } from "@/lib/api";
import { createBookingCheckout } from "@/lib/marketplace";
import { getRequestUser } from "@/lib/request-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = getRequestUser(request.headers, "guardian");
    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const checkout = await createBookingCheckout(body, actor!, origin);

    return jsonOk(checkout, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
