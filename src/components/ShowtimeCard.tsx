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
    <button className="btn-accent btn h-10 w-24 rounded p-0 text-base font-bold text-base-100">
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
      <h4 className="mb-2 font-bold text-base-100 underline">Showtimes</h4>
      {/* TODO: Should do - https://stackoverflow.com/questions/71035013/how-to-create-a-tailwindcss-grid-with-a-dynamic-amount-of-grid-columns */}
      <div className="grid grid-cols-3 justify-items-center gap-y-2 lg:grid-cols-6">
        {showtimes.data?.showtimes.map((showtime) => (
          <Showtime time={showtime.time} key={showtime.showtimeId} />
        ))}
      </div>
    </section>
  );
}
