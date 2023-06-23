import { NextResponse } from "next/server";
import { caller } from "~/server/api/root";

export default async function handler() {
  const { showtimes } = await caller.showtimes.getAllShowtimes();

  console.log(showtimes.length);
  return NextResponse.json({ message: "fuck you" });
}
