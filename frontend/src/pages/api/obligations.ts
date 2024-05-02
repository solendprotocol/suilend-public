import { inflateSync } from "zlib";

import type { NextApiRequest, NextApiResponse } from "next";

import { API_URL } from "@/lib/navigation";

export const config = {
  maxDuration: 300,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const url = `${API_URL}/obligations/all?compressed=true`;

  try {
    const response = await fetch(url);
    const compressedJson = await response.json();
    const json = JSON.parse(
      inflateSync(Buffer.from(compressedJson.data, "base64")).toString(),
    );

    res.status(200).json(json);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}
