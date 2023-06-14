import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const showtimeRouter = createTRPCRouter({
  getShowtimes: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ input: { movieId }, ctx }) => {
      const showtimes = await ctx.prisma.showtime.findMany({
        where: {
          movieId,
        },
        orderBy: {
          time: "asc",
        },
      });

      return {
        showtimes,
      };
    }),
  getShowtime: publicProcedure
    .input(z.object({ showtimeId: z.number() }))
    .query(async ({ input: { showtimeId }, ctx }) => {
      const showtime = await ctx.prisma.showtime.findUnique({
        where: {
          showtimeId,
        },
      });

      return {
        showtime,
      };
    }),
  getAllShowtimes: publicProcedure.query(async ({ ctx }) => {
    const showtimes = await ctx.prisma.showtime.findMany({
      select: {
        showtimeId: true,
        movieId: true,
      },
    });

    return { showtimes };
  }),
});
