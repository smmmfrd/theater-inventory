import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const movieRouter = createTRPCRouter({
  getMovies: publicProcedure.query(async ({ ctx }) => {
    const movieData = await ctx.prisma.movie.findMany({
      select: {
        movieId: true,
        title: true,
        posterImage: true,
        _count: {
          select: {
            showtimes: true,
          },
        },
      },
      orderBy: {
        ranking: "asc",
      },
    });

    const movies = movieData.map((movie) => ({
      movieId: movie.movieId,
      title: movie.title,
      posterImage: movie.posterImage,
      showtimeCount: movie._count.showtimes,
    }));

    return {
      movies,
    };
  }),
  getMovieIds: publicProcedure.query(async ({ ctx }) => {
    const movies = await ctx.prisma.movie.findMany({});
    const movieIds = movies.map((movie) => movie.movieId);
    return {
      movieIds,
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
  getMoviesWithShowtimes: publicProcedure.query(async ({ ctx }) => {
    const moviesWithShowtimes = await ctx.prisma.movie.findMany({
      select: {
        title: true,
        movieId: true,
        showtimes: {
          select: {
            time: true,
            showtimeId: true,
          },
          orderBy: {
            time: "asc",
          },
        },
      },
      orderBy: {
        ranking: "asc",
      },
    });

    return { moviesWithShowtimes };
  }),
});
