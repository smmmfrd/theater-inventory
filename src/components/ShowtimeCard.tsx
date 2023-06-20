import { Showtime } from "@prisma/client";
import Link from "next/link";
import { api } from "~/utils/api";

type ShowtimeCardProps = {
  styleExtensions?: string;
  movieId: number;
};

export const dateFormatter = new Intl.DateTimeFormat("default", {
  hour: "numeric",
  minute: "numeric",
});

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

function Showtime({ showtime }: { showtime: Showtime }) {
  const width =
    showtimeAvailabilityWidths[
      `${Math.ceil(
        12 - (showtime.availableSeats / showtime.maxSeats) * 12
      )}` as keyof typeof showtimeAvailabilityWidths
    ];

  return (
    <Link
      href={`/movies/${showtime.movieId}/${showtime.showtimeId}`}
      className="btn-accent btn relative h-10 w-24 overflow-hidden rounded p-0 text-base font-bold text-base-100"
    >
      {dateFormatter.format(showtime.time)}
      <span
        className={`absolute bottom-0 left-0 h-1 bg-base-100 ${width}`}
      ></span>
    </Link>
  );
}

export default function ShowtimeCard({
  styleExtensions = "",
  movieId,
}: ShowtimeCardProps) {
  const showtimes = api.showtimes.getShowtimes.useQuery(
    { movieId },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  return (
    <section className={`bg-neutral ${styleExtensions}`}>
      <h4 className="mb-2 font-bold text-base-100 underline">Showtimes</h4>
      {/* TODO: Should do - https://stackoverflow.com/questions/71035013/how-to-create-a-tailwindcss-grid-with-a-dynamic-amount-of-grid-columns */}
      <div className="grid grid-cols-3 justify-items-center gap-y-2 lg:grid-cols-6">
        {showtimes.data?.showtimes.map((showtime) => (
          <Showtime showtime={showtime} key={showtime.showtimeId} />
        ))}
        {showtimes.data?.showtimes[0]?.time.toString()}
      </div>
    </section>
  );
}
