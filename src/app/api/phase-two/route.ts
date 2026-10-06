import { NextResponse } from "next/server";

const SKINSTRIC_PHASE_TWO_API =
  "https://us-central1-frontend-simplified.cloudfunctions.net/skinstricPhaseTwo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const image = typeof body.Image === "string" ? body.Image.trim() : "";

    if (!image) {
      return NextResponse.json(
        { error: "A Base64 image is required." },
        { status: 400 }
      );
    }

    const response = await fetch(SKINSTRIC_PHASE_TWO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: image,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            data?.message ||
            "Skinstric Phase 2 API request failed.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Phase 2 API error:", error);

    return NextResponse.json(
      { error: "Unable to connect to the Skinstric Phase 2 API." },
      { status: 500 }
    );
  }
}

