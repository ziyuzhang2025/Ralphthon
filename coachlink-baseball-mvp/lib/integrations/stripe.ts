import Stripe from "stripe";
import type { Booking, CoachProfile } from "@/lib/types";

interface CheckoutInput {
  booking: Booking;
  coach: CoachProfile;
  origin: string;
}

export async function createCheckoutForBooking({ booking, coach, origin }: CheckoutInput) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || !process.env.NEXT_PUBLIC_APP_URL) {
    return {
      checkoutSessionId: `cs_demo_${booking.id}`,
      checkoutUrl: `${origin}/checkout/success?bookingId=${booking.id}&session_id=cs_demo_${booking.id}`,
      mode: "demo" as const,
    };
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coaches/${coach.id}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: booking.priceCents,
          product_data: {
            name: `${coach.name} live baseball coaching session`,
            description: `${coach.sessionLengthMinutes}-minute remote session`,
          },
        },
      },
    ],
    payment_intent_data: coach.payoutReady && coach.stripeConnectAccountId
      ? {
          application_fee_amount: booking.platformFeeCents,
          transfer_data: {
            destination: coach.stripeConnectAccountId,
          },
        }
      : undefined,
    metadata: {
      bookingId: booking.id,
      coachId: coach.id,
      guardianId: booking.guardianId,
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  return {
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
    mode: "stripe" as const,
  };
}

export async function parseStripeWebhook(body: string, signature: string | null) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (secretKey && webhookSecret && signature) {
    const stripe = new Stripe(secretKey);
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  return JSON.parse(body) as {
    type: string;
    data: {
      object: {
        id?: string;
        metadata?: {
          bookingId?: string;
        };
      };
    };
  };
}
