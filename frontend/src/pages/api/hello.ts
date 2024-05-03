import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    res.status(200).json({ hello: "world" });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}
