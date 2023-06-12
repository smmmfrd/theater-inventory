import { PrismaClient, Movie } from "@prisma/client";
require("dotenv").config();

const prisma = new PrismaClient();

type TopMovies = [Movie, Movie, Movie, Movie, Movie, Movie, Movie, Movie];

async function getMovies() {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_DB_API_KEY}&page=1`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const res = await fetch(url, options);
  const json = await res.json();
  const movies: TopMovies = json.results
    .filter((_: any, i: number) => i < 8)
    .map((movie: any) => {
      return {
        movieId: movie.id,
        title: movie.title,
        description: movie.overview,
        posterImage: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
        backdropImage: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
      };
    });

  return movies;
}

async function buildTheaters(movies: TopMovies) {
  const indexToMovie = (index: number, even: boolean) => {
    // Should not have .title in final version.
    if (index % 2 == 0) {
      return movies[0].title;
    } else {
      if (index < 4) {
        return movies[1].title;
      } else if (index < 8) {
        return movies[2].title;
      } else if (index < 12) {
        return movies[3].title;
      } else if (index < 14) {
        return movies[even ? 4 : 5].title;
      } else {
        return movies[even ? 6 : 7].title;
      }
    }
  };

  const newTheater = (_: any, index: number) => {
    const startTime = 10.5 + Math.floor(index / 2) * 0.25;
    const showtimes = [];

    let even = false;
    for (let time = startTime; time < 24; time += 3) {
      even = !even;
      // Uncomment this
      // showtimes.push({
      //   time,
      //   movie: indexToMovie(index, even),
      // });
      showtimes.push(indexToMovie(index, even));
    }

    return {
      number: index,
      showtimes,
    };
  };

  const theaters = [...Array(16).fill(0).map(newTheater)];
  return theaters;
}

async function reset() {
  const movies = await getMovies();
  // console.log(movies[0]);

  await prisma.movie.deleteMany();
  const create = await prisma.movie.create({
    data: {
      ...movies[0],
    },
  });
  console.log(create);
}

reset();
