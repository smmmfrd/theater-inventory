import { useEffect } from "react";
import { api } from "~/utils/api";

type ShowtimeCardProps = {
  styleExtensions?: string;
  movieId: number;
};

const dateFormatter = new Intl.DateTimeFormat("default", {
  hour: "numeric",
  minute: "numeric",
});

type ShowtimeProps = {
  time: Date;
};

function Showtime({ time }: ShowtimeProps) {
  return (
    <button className="text-md btn-accent h-10 w-20 rounded text-base font-bold text-base-100">
      {dateFormatter.format(time)}
    </button>
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
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  return (
    <section className={`bg-neutral ${styleExtensions}`}>
      <h4 className="text-base-100">Showtimes</h4>
      {showtimes.data?.showtimes.map((showtime) => (
        <Showtime time={showtime.time} key={showtime.showtimeId} />
      ))}
    </section>
  );
}
