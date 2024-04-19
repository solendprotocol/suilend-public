import type { NextApiRequest, NextApiResponse } from "next";

import { API_URL } from "@/lib/navigation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const response = await fetch(`${API_URL}/obligations/all`);
    const json = await response.json();

    res.status(200).json(json);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
}
