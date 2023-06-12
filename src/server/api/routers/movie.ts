import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const movieRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getMovies: publicProcedure.query(async ({ ctx }) => {
    const movies = await ctx.prisma.movie.findMany({
      select: {
        movieId: true,
        title: true,
        image: true,
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
