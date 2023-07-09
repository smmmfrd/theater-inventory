import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, type Movie } from "@prisma/client";
import "dotenv/config";
import moment from "moment-timezone";
import { TICKET_PRICES } from "~/utils";

const START_HOUR = 12;
const HOURS_BETWEEN = 3;
const MINUTES_BETWEEN = 10;

type TheaterData = {
  movieRank: number[];
  maxSeats: number;
};

interface MovieIndexMapType {
  [key: string]: TheaterData;
}
// A map to find what movie goes to which theater.
// Key = Theater number/id
// movieRank = Ranking/index of the movie being shown in that theater
// maxSeats = Number of seats in that theater
const THEATER_TO_MOVIE: MovieIndexMapType = {
  "0": { movieRank: [0, 0], maxSeats: 128 },
  "1": { movieRank: [1, 1], maxSeats: 128 },
  "2": { movieRank: [0, 0], maxSeats: 80 },
  "3": { movieRank: [1, 1], maxSeats: 80 },
  "4": { movieRank: [0, 0], maxSeats: 64 },
  "5": { movieRank: [2, 2], maxSeats: 64 },
  "6": { movieRank: [0, 0], maxSeats: 64 },
  "7": { movieRank: [2, 2], maxSeats: 64 },
  "8": { movieRank: [0, 0], maxSeats: 64 },
  "9": { movieRank: [3, 3], maxSeats: 64 },
  "10": { movieRank: [0, 0], maxSeats: 64 },
  "11": { movieRank: [3, 3], maxSeats: 64 },
  "12": { movieRank: [0, 0], maxSeats: 40 },
  "13": { movieRank: [5, 4], maxSeats: 40 },
  "14": { movieRank: [1, 1], maxSeats: 40 },
  "15": { movieRank: [7, 6], maxSeats: 40 },
};

const getMovieIndex = (
  index: number,
  even: boolean
): { movieRank: number; maxSeats: number } => {
  // Even just determines flickering between the bottom two movies
  const movieIndexData = THEATER_TO_MOVIE[`${index}`];
  if (movieIndexData === undefined) {
    return {
      movieRank: -1,
      maxSeats: -1,
    };
  }
  return {
    movieRank: movieIndexData.movieRank[+even]!,
    maxSeats: movieIndexData.maxSeats,
  };
};

const getTicketPrice = (hour: number) => {
  if (hour < 16) {
    return TICKET_PRICES.matinee;
  } else if (hour < 20) {
    return TICKET_PRICES.afternoon;
  } else {
    return TICKET_PRICES.lateNight;
  }
};

const prisma = new PrismaClient();

type TMDBMovie = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: 385687;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type TMDBRes = {
  results: TMDBMovie[];
};

async function getMovies() {
  if (
    process.env.MOVIE_DB_API_KEY === null ||
    process.env.MOVIE_DB_API_KEY === undefined
  ) {
    return;
  }

  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.MOVIE_DB_API_KEY}&page=1`;
  const options = { method: "GET", headers: { accept: "application/json" } };

  const res = await fetch(url, options);
  const json = (await res.json()) as TMDBRes;
  const movies: Movie[] = json.results
    .filter((_: TMDBMovie, i: number) => i < 8)
    .map((movie: TMDBMovie, index: number): Movie => {
      return {
        movieId: movie.id,
        title: movie.title,
        description: movie.overview,
        posterImage: `https://image.tmdb.org/t/p/w780${movie.poster_path}`,
        backdropImage: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
        ranking: index,
      };
    });

  return movies;
}

function makeShowtimes(startTime: moment.Moment) {
  const showtimes = [startTime];
  let newTime = moment(startTime).add(HOURS_BETWEEN, "hours");
  while (!newTime.isAfter(startTime, "day")) {
    showtimes.push(newTime);
    newTime = moment(newTime).add(HOURS_BETWEEN, "hours");
  }

  return showtimes;
}

function MakeTheaters(startTime: moment.Moment) {
  const theaters = Array(16)
    .fill(0)
    .map((_, index) => {
      const theaterStart = moment(startTime).add(
        MINUTES_BETWEEN * index,
        "minutes"
      );
      const showtimes = makeShowtimes(theaterStart);

      return {
        theaterId: index,
        showtimes,
      };
    });

  return theaters;
}

export default async function reset(req: NextApiRequest, res: NextApiResponse) {
  // Clear out all old data
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();

  // Create the start date
  const showDate = moment().tz("America/Los_Angeles").weekday(7).set({
    hour: START_HOUR,
    minute: 0,
    second: 0,
  });

  // Create the starting data
  const movieData = await getMovies();

  if (movieData === undefined) {
    console.log("Movie Fetch returned undefined");
    // Yes I know it should be a different status & message, but vercel cron jobs are still in beta...
    res.status(200).json({ message: "Success" });
    return;
  }
  const theaterData = MakeTheaters(showDate);

  const showtimes = theaterData
    .map(({ showtimes, theaterId }) => {
      return showtimes.map((showtime, index) => {
        const { movieRank, maxSeats } = getMovieIndex(
          theaterId,
          index % 2 == 0
        );
        const ticketPrice = getTicketPrice(showtime.hour());
        return {
          time: showtime.toDate(),
          maxSeats,
          theaterId,
          movieId: movieData[movieRank]?.movieId || 0,
          ticketPrice,
        };
      });
    })
    .flat();

  // Push the basic data to prisma
  await prisma.movie.createMany({ data: [...movieData] });
  await prisma.theater.createMany({
    data: theaterData.map((theater) => ({
      theaterId: theater.theaterId,
    })),
  });
  await prisma.showtime.createMany({
    data: showtimes,
  });

  // Trigger redeploy
  if (
    process.env.RESET_LINK !== null &&
    process.env.RESET_LINK !== undefined &&
    !!process.env.VERCEL_URL
  ) {
    await fetch(`${process.env.RESET_LINK}`);
    console.log("Called redeploy link");
  }

  console.log("Theater Reset.");

  res.status(200).json({ message: "Success" });
}
