import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = "https://api.suilend.fi";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const response = await fetch(`${API_URL}/obligations/all`);
    const json = await response.json();

    res.status(200).json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: ((err as Error)?.message || err) as string });
  }
}
