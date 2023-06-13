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
});
