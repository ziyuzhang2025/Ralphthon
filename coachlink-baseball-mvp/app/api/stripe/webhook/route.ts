import { jsonError, jsonOk } from "@/lib/api";
import { parseStripeWebhook } from "@/lib/integrations/stripe";
import { fulfillCheckoutSession } from "@/lib/marketplace";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const event = await parseStripeWebhook(body, request.headers.get("stripe-signature"));

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await fulfillCheckoutSession(session.id ?? "", session.metadata?.bookingId);
    }

    return jsonOk({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
