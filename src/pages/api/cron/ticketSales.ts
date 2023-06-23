import { NextApiResponse } from "next";
import { caller } from "~/server/api/root";

export default async function TicketSales(res: NextApiResponse) {
  const { showtimes } = await caller.showtimes.getAllShowtimes();

  console.log(showtimes.length);
  res.status(200).json({ success: true });
}
