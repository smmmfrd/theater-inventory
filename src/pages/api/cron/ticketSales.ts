import { PrismaClient, type TicketOrder } from "@prisma/client";

const prisma = new PrismaClient();

const RANDOM_PURCHASE_RATE = 0.15;

type FlatShowtime = {
  showtimeId: number;
  time: Date;
  tickets: TicketOrder[];
  movie: {
    title: string;
  };
};

interface FullShowtime extends FlatShowtime {
  availableSeats: number;
}

const randomSales = (availableSeats: number) => {
  return Math.max(
    1 + Math.ceil(Math.random() * availableSeats * RANDOM_PURCHASE_RATE),
    availableSeats
  );
};

function ShuffleArray<T>(arr: T[]): T[] {
  const shuffled: T[] = arr.sort(() => Math.random() - 0.5);
  return shuffled;
}

async function CreateSales(showtimes: FullShowtime[], name: string) {
  const randomizedShowtimes = ShuffleArray(showtimes);

  const preSales = randomizedShowtimes.map((showtime, index) => {
    return {
      name: `${name} ${index}`,
      number: randomSales(showtime.availableSeats),
      movieTitle: showtime.movie.title,
      showtimeId: showtime.showtimeId,
    };
  });

  const sales = await Promise.all(preSales);

  return sales;
}

const sanitizeShowtime = (
  showtime: FlatShowtime[],
  minHour: number,
  maxHour: number
): FullShowtime[] => {
  return showtime
    .map((showtime) => ({
      ...showtime,
      availableSeats: showtime.tickets.reduce(
        (acc, { number }) => acc + number,
        0
      ),
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
  const showtimes = await prisma.showtime.findMany({
    select: {
      showtimeId: true,
      time: true,
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

  const sales = await Promise.all([
    CreateSales(matineeShowtimes, "Old Couple"),
    CreateSales(afternoonShowtimes, "Couple w/ Kids"),
    CreateSales(lateNightShowtimes, "Teenage Group"),
  ]);

  await prisma.ticketOrder.createMany({
    data: sales.flat(),
  });

  // const orders = sales.flat().map(async (sale) => {
  //   return await prisma.showtime.update({
  //     where: {
  //       showtimeId: sale.showtimeId,
  //     },
  //     data: {
  //       availableSeats: {
  //         decrement: sale.number,
  //       },
  //     },
  //   });
  // });

  // await Promise.all(orders);

  console.log("Random Tickets Ordered");
  console.timeEnd("Exec");
}

if (!process.env.VERCEL_URL) {
  void TicketSales();
}
