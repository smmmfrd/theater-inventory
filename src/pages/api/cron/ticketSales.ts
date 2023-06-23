import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler() {
  const prisma = new PrismaClient();
  const showtimes = await prisma.showtime.findMany({
    select: {
      showtimeId: true,
      time: true,
      maxSeats: true,
      movie: {
        select: {
          title: true,
        },
      },
      tickets: true,
    },
    orderBy: {
      time: "asc",
    },
  });

  console.log(showtimes.length);
  return NextResponse.json({ message: "fuck you" });
}
