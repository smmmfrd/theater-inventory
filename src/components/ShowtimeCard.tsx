import { useEffect } from "react";

type ShowtimeCardProps = {
  styleExtensions?: string;
};

const dateFormatter = new Intl.DateTimeFormat("default", {
  hour: "numeric",
  minute: "numeric",
});

export default function ShowtimeCard({
  styleExtensions = "",
}: ShowtimeCardProps) {
  return (
    <section className={`bg-neutral ${styleExtensions}`}>
      <h4 className="text-base-100">Showtimes</h4>
    </section>
  );
}

type ShowtimeProps = {
  time: string;
};

function Showtime({ time }: ShowtimeProps) {
  return (
    <button className="btn-accent h-10 w-20 rounded font-bold text-base-100">
      {time}
    </button>
  );
}
