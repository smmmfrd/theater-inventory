import { Showtime } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const showtimeRouter = createTRPCRouter({
  getShowtimes: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ input: { movieId }, ctx }) => {
      const queryShowtimes = await ctx.prisma.showtime.findMany({
        where: {
          movieId,
        },
        orderBy: {
          time: "asc",
        },
        include: {
          tickets: true,
        },
      });

      const showtimes = queryShowtimes.map((showtime) => ({
        showtimeId: showtime.showtimeId,
        movieId: showtime.movieId,
        maxSeats: showtime.maxSeats,
        time: showtime.time,
        availableSeats:
          showtime.maxSeats -
          showtime.tickets.reduce((acc, { number }) => acc + number, 0),
      }));

      return {
        showtimes,
      };
    }),
  getShowtime: publicProcedure
    .input(z.object({ showtimeId: z.number() }))
    .query(async ({ input: { showtimeId }, ctx }) => {
      const queryShowtime = await ctx.prisma.showtime.findUnique({
        where: {
          showtimeId,
        },
        include: {
          tickets: true,
        },
      });

      if (queryShowtime === null)
        return {
          showtime: {
            showtimeId: 0,
            time: new Date(),
            maxSeats: 0,
            theaterId: 0,
            movieId: 0,
            availableSeats: 0,
            ticketPrice: 0,
          },
        };

      const showtime = {
        showtimeId: queryShowtime.showtimeId,
        time: queryShowtime.time,
        maxSeats: queryShowtime.maxSeats,
        theaterId: queryShowtime.theaterId,
        movieId: queryShowtime.movieId,
        ticketPrice: queryShowtime.ticketPrice,
        availableSeats:
          queryShowtime.maxSeats -
          queryShowtime.tickets.reduce((acc, { number }) => acc + number, 0),
      };

      return {
        showtime,
      };
    }),
  getAllShowtimes: publicProcedure.query(async ({ ctx }) => {
    const showtimes = await ctx.prisma.showtime.findMany({
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

    return { showtimes };
  }),
  getAllShowtimeAndMovieIds: publicProcedure.query(async ({ ctx }) => {
    const showtimes = await ctx.prisma.showtime.findMany({
      select: {
        showtimeId: true,
        movieId: true,
      },
    });

    return { showtimes };
  }),
  getFirstShowtime: publicProcedure.query(async ({ ctx }) => {
    const showtimes = await ctx.prisma.showtime.findMany({
      orderBy: {
        time: "asc",
      },
      take: 1,
    });

    return { firstShowtime: showtimes[0] };
  }),
});
