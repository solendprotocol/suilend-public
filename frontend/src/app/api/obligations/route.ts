import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api.suilend.fi";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/obligations/all`);
    const json = await response.json();

    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: ((err as Error)?.message || err) as string },
      { status: 500 },
    );
  }
}
