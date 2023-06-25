import { NextApiRequest, NextApiResponse } from "next";
import { caller } from "~/server/api/root";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { showtimes } = await caller.showtimes.getAllShowtimes();

  console.log(showtimes.length);

  res.status(200);
}
