import { caller } from "~/server/api/root";

export default async function TicketSales() {
  const { showtimes } = await caller.showtimes.getAllShowtimes();

  console.log(showtimes.length);
}
