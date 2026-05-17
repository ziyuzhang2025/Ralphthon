import type { Booking } from "@/lib/types";

interface DailyRoomResult {
  roomName: string;
  roomUrl: string;
  mode: "daily" | "demo";
}

export async function createDailyRoomForBooking(booking: Booking): Promise<DailyRoomResult> {
  const roomName = `booking-${booking.id}`;
  const apiKey = process.env.DAILY_API_KEY;

  if (!apiKey) {
    return {
      roomName,
      roomUrl: `https://demo.daily.co/${roomName}`,
      mode: "demo",
    };
  }

  const response = await fetch("https://api.daily.co/v1/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        enable_chat: true,
        exp: Math.floor(new Date(booking.endsAt).getTime() / 1000) + 90 * 60,
        nbf: Math.floor(new Date(booking.startsAt).getTime() / 1000) - 15 * 60,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Daily room creation failed: ${response.status}`);
  }

  const room = (await response.json()) as { name: string; url: string };

  return {
    roomName: room.name,
    roomUrl: room.url,
    mode: "daily",
  };
}
