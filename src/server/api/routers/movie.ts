import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const movieRouter = createTRPCRouter({
  getMovies: publicProcedure.query(async ({ ctx }) => {
    const movies = await ctx.prisma.movie.findMany({
      select: {
        movieId: true,
        title: true,
        posterImage: true,
      },
    });

    return {
      movies,
    };
  }),
  getMovieIds: publicProcedure.query(async ({ ctx }) => {
    const movies = await ctx.prisma.movie.findMany({});
    return {
      movieIds: movies.map((movie) => movie.movieId),
    };
  }),
  getMovie: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ input: { movieId }, ctx }) => {
      const movie = await ctx.prisma.movie.findUnique({
        where: { movieId },
      });

      return { movie };
    }),
});
