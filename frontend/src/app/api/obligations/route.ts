import { inflateSync } from "zlib";

import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api.suilend.fi";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/obligations/all?compressed=true`);
    const compressedJson = await response.json();
    const json = JSON.parse(
      inflateSync(Buffer.from(compressedJson.data, "base64")).toString(),
    );

    return NextResponse.json(json, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: ((err as Error)?.message || err) as string },
      { status: 500 },
    );
  }
}
