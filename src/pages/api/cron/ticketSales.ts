import { PrismaClient, type TicketOrder } from "@prisma/client";
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

export default async function TicketSales() {
  console.time("Exec");
  // We can assume the showtimes have been created.
  // We should still only get ones that have available seats.
  const { showtimes } = await caller.showtimes.getAllShowtimes();

  const matineeShowtimes = sanitizeShowtime(showtimes, 10, 14);
  const afternoonShowtimes = sanitizeShowtime(showtimes, 14, 18);
  const lateNightShowtimes = sanitizeShowtime(showtimes, 18, 24);

  const sales = [
    CreateSales(matineeShowtimes, "Old Couple"),
    CreateSales(afternoonShowtimes, "Couple w/ Kids"),
    CreateSales(lateNightShowtimes, "Teenage Group"),
  ].flat();

  const orders = await caller.ticketOrders.createManyOrders(sales);

  console.log(orders, "Random Tickets Orders Made");
  console.timeEnd("Exec");
}

async function LocalTicketSales() {
  console.time("Exec");
  const prisma = new PrismaClient();

  // We can assume the showtimes have been created.
  // We should still only get ones that have available seats.
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

  const matineeShowtimes = sanitizeShowtime(showtimes, 10, 14);
  const afternoonShowtimes = sanitizeShowtime(showtimes, 14, 18);
  const lateNightShowtimes = sanitizeShowtime(showtimes, 18, 24);

  const sales = [
    CreateSales(matineeShowtimes, "Old Couple"),
    CreateSales(afternoonShowtimes, "Couple w/ Kids"),
    CreateSales(lateNightShowtimes, "Teenage Group"),
  ].flat();

  const orders = await prisma.ticketOrder.createMany({
    data: sales,
  });

  console.log(orders.count, "Random Tickets Orders Made");
  console.timeEnd("Exec");
}

if (!process.env.VERCEL_URL) {
  void LocalTicketSales();
}
