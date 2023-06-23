import { NextApiResponse } from "next";
import { caller } from "~/server/api/root";

export default async function handler(res: NextApiResponse) {
  const { showtimes } = await caller.showtimes.getAllShowtimes();

  console.log(showtimes.length);
  res.send({ message: "Cool" });
}
