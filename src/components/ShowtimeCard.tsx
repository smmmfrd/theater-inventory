import Link from "next/link";
import { api } from "~/utils/api";

export const dateFormatter = new Intl.DateTimeFormat("default", {
  hour: "numeric",
  minute: "numeric",
});

// Tailwind needs to compile all class names, so we can't have fully dynamic widths, so we use a table.
const showtimeAvailabilityWidths = {
  "0": "w-0",
  "1": "w-1/12",
  "2": "w-2/12",
  "3": "w-3/12",
  "4": "w-4/12",
  "5": "w-5/12",
  "6": "w-6/12",
  "7": "w-7/12",
  "8": "w-8/12",
  "9": "w-9/12",
  "10": "w-10/12",
  "11": "w-11/12",
  "12": "w-full",
};

type MiniShowtime = {
  availableSeats: number;
  maxSeats: number;
  movieId: number;
  showtimeId: number;
  time: Date;
};

type ShowtimePieceProps = {
  showtime: MiniShowtime;
};

function ShowtimePiece({ showtime }: ShowtimePieceProps) {
  const width =
    showtimeAvailabilityWidths[
      `${Math.ceil(
        12 - (showtime.availableSeats / showtime.maxSeats) * 12
      )}` as keyof typeof showtimeAvailabilityWidths
    ];

  return (
    <Link
      href={`/movies/${showtime.movieId}/${showtime.showtimeId}`}
      className="btn-accent btn relative h-10 w-24 overflow-hidden rounded border-0 p-0 text-base font-bold"
      title={`This showing is ${Math.round(
        ((showtime.maxSeats - showtime.availableSeats) / showtime.maxSeats) *
          100
      )}% full`}
    >
      {dateFormatter.format(showtime.time)}
      <span
        className={`absolute bottom-0 left-0 h-1 bg-primary ${width}`}
      ></span>
    </Link>
  );
}

type ShowtimeCardProps = {
  styleExtensions?: string;
  movieId: number;
  showtimeCount?: number;
};

export default function ShowtimeCard({
  styleExtensions = "",
  movieId,
  showtimeCount,
}: ShowtimeCardProps) {
  const { data, isLoading } = api.showtimes.getShowtimes.useQuery(
    { movieId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  return (
    <section className={`${styleExtensions}`}>
      <h4 className="mb-2 font-bold text-base-content underline">Showtimes</h4>
      <div className="flex flex-wrap justify-center gap-2">
        {isLoading
          ? showtimeCount &&
            Array(showtimeCount)
              .fill(0)
              .map((_, index) => (
                <button
                  key={index}
                  className="btn-disabled btn h-10 w-24 overflow-hidden rounded border-0 p-0 text-base font-bold"
                >
                  {/* --:-- -- */}
                  <span className="loading loading-dots"></span>
                </button>
              ))
          : data?.showtimes.map((showtime) => (
              <ShowtimePiece showtime={showtime} key={showtime.showtimeId} />
            ))}
      </div>
    </section>
  );
}
