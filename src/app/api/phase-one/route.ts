import { NextResponse } from "next/server";

const SKINSTRIC_PHASE_ONE_API = "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseOne";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";

    if (!name || !location || /\d/.test(name) || /\d/.test(location)) {
      return NextResponse.json({ error: "Name and location are required." }, { status: 400 });
    }

    const response = await fetch(SKINSTRIC_PHASE_ONE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Skinstric API request failed." },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Phase 1 API error:", error);
    return NextResponse.json(
      { error: "Unable to connect to the Skinstric API." },
      { status: 500 }
    );
  }
}

