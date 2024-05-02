import type { NextApiRequest, NextApiResponse } from "next";

import { API_URL } from "@/lib/navigation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as Record<string, string>;
  const url = `${API_URL}/events?${new URLSearchParams(query)}`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    res.status(200).json(json);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
}
