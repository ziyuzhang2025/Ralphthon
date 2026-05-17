import { jsonError, jsonOk } from "@/lib/api";
import { submitCoachApplication } from "@/lib/marketplace";

function splitList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coach = await submitCoachApplication({
      ...body,
      specialties: splitList(body.specialties),
      credentials: splitList(body.credentials),
      yearsExperience: Number(body.yearsExperience),
      hourlyRateCents: Math.round(Number(body.hourlyRateDollars) * 100),
    });

    return jsonOk({ coach }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
