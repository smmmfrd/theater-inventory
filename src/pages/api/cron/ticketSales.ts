import { type TicketOrder } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { caller } from "~/server/api/root";

const RANDOM_PURCHASE_RATE = 0.15;

type FlatShowtime = {
  showtimeId: number;
  time: Date;
  tickets: TicketOrder[];
  maxSeats: number;
  movie: {
    title: string;
  };
};

interface FullShowtime extends FlatShowtime {
  availableSeats: number;
}

const sanitizeShowtime = (
  showtimes: FlatShowtime[],
  minHour: number,
  maxHour: number
): FullShowtime[] => {
  return showtimes
    .map((showtime) => ({
      ...showtime,
      availableSeats:
        showtime.maxSeats -
        showtime.tickets.reduce((acc, { number }) => acc + number, 0),
    }))
    .filter(({ time, availableSeats }) => {
      return (
        time.getHours() >= minHour &&
        time.getHours() < maxHour &&
        availableSeats > 0
      );
    });
};

const randomSales = (availableSeats: number) => {
  return Math.min(
    1 + Math.ceil(Math.random() * availableSeats * RANDOM_PURCHASE_RATE),
    availableSeats
  );
};

function ShuffleArray<T>(arr: T[]): T[] {
  const shuffled: T[] = arr.sort(() => Math.random() - 0.5);
  return shuffled;
}

function CreateSales(showtimes: FullShowtime[], name: string) {
  const randomizedShowtimes = ShuffleArray(showtimes);

  const orders = randomizedShowtimes.map((showtime, index) => {
    return {
      name: `${name} ${index}`,
      number: randomSales(showtime.availableSeats),
      movieTitle: showtime.movie.title,
      showtimeId: showtime.showtimeId,
    };
  });

  return orders;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { showtimes } = await caller.showtimes.getAllShowtimes();

  console.log(showtimes.length);

  const matineeShowtimes = sanitizeShowtime(showtimes, 10, 14);
  const afternoonShowtimes = sanitizeShowtime(showtimes, 14, 18);
  const lateNightShowtimes = sanitizeShowtime(showtimes, 18, 24);

  const sales = [
    CreateSales(matineeShowtimes, "Old Couple"),
    CreateSales(afternoonShowtimes, "Couple w/ Kids"),
    CreateSales(lateNightShowtimes, "Teenage Group"),
  ].flat();

  const orders = await caller.ticketOrders.createManyOrders(sales);

  console.log(orders, " random ticket orders made.");
  // Ok, so it needs this line to make it go.
  // Literally never says this anywhere lmao, and they even do it wrong in their own example.
  // Also watch that memory used...
  res.status(200).json({ message: "Success" });
}
