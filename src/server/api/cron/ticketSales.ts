import { PrismaClient, Showtime, TicketOrder } from "@prisma/client";
require("dotenv").config();

const prisma = new PrismaClient();

const RANDOM_PURCHASE_RATE = 0.15;

const randomSales = (availableSeats: number) => {
  return 1 + Math.ceil(Math.random() * availableSeats * RANDOM_PURCHASE_RATE);
};

function ShuffleArray<T>(arr: T[]): T[] {
  const shuffled: T[] = arr.sort(() => Math.random() - 0.5);
  return shuffled;
}

async function CreateSales(showtimes: Showtime[], name: string) {
  const randomizedShowtimes = ShuffleArray(showtimes);

  const preSales = randomizedShowtimes.map(async (showtime, index) => {
    // We need to get it's movie
    const movie = await prisma.movie.findFirst({
      where: {
        movieId: showtime.movieId,
      },
    });
    const movieTitle = movie!.title;

    return {
      name: `${name} ${index}`,
      number: randomSales(showtime.availableSeats),
      movieTitle,
      showtimeId: showtime.showtimeId,
    };
  });

  const sales = await Promise.all(preSales);

  return sales;
}

async function TicketSales() {
  // We can assume the showtimes have been created.
  // We should still only get ones that have available seats.
  const showtimes = await prisma.showtime.findMany({
    where: {
      availableSeats: {
        gt: 0,
      },
    },
    orderBy: {
      time: "asc",
    },
  });

  const matineeShowtimes = showtimes.filter(
    ({ time }) => time.getHours() >= 10 && time.getHours() < 14
  );
  const afternoonShowtimes = showtimes.filter(
    ({ time }) => time.getHours() >= 14 && time.getHours() < 18
  );
  const lateNightShowtimes = showtimes.filter(
    ({ time }) => time.getHours() >= 18 && time.getHours() <= 23
  );

  const sales = await Promise.all([
    CreateSales(matineeShowtimes, "Old Couples"),
    CreateSales(afternoonShowtimes, "Old Couples"),
    CreateSales(lateNightShowtimes, "Old Couples"),
  ]);

  await prisma.ticketOrder.createMany({
    data: sales.flat(),
  });

  const orders = sales.flat().map(async (sale) => {
    await prisma.showtime.update({
      where: {
        showtimeId: sale.showtimeId,
      },
      data: {
        availableSeats: {
          decrement: sale.number,
        },
      },
    });
  });

  await Promise.all(orders);

  console.log("Tickets Ordered");
}

TicketSales();
