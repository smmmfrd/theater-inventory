import { PrismaClient, Movie, Theater, Showtime } from "@prisma/client";
require("dotenv").config();

const prisma = new PrismaClient();

type TopMovies = [Movie, Movie, Movie, Movie, Movie, Movie, Movie, Movie];

type Theaters = [
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater,
  Theater
];

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
        backdropImage: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
      };
    });

  return movies;
}

async function buildTheaters(movies: TopMovies) {
  const indexToMovie = (index: number, even: boolean) => {
    // Should not have .title in final version.
    if (index % 2 == 0) {
      return movies[0];
    } else {
      if (index < 4) {
        return movies[1];
      } else if (index < 8) {
        return movies[2];
      } else if (index < 12) {
        return movies[3];
      } else if (index < 14) {
        return movies[even ? 4 : 5];
      } else {
        return movies[even ? 6 : 7];
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
      showtimes.push({
        time,
        movie: indexToMovie(index, even),
      });
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
  const currentDate = new Date();
  currentDate.setHours(10, 30, 0, 0);
  const showDate = new Date(
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7)
  );
  console.log("Show Date:", showDate.toLocaleString());

  // const movies = await getMovies();
  // // console.log(movies[0]);
  // const theater: Theater = {
  //   theaterId: 0,
  // };
  // const showtimes: Showtime = {
  //   time:
  // }

  // await prisma.movie.deleteMany();
  // const create = await prisma.movie.create({
  //   data: {
  //     ...movies[0],
  //   },
  // });
  // console.log(create);
}

reset();
