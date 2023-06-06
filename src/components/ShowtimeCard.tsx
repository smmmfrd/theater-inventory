type ShowtimeCardProps = {
  time: Date;
};

const dateFormatter = new Intl.DateTimeFormat("default", {
  hour: "numeric",
  minute: "numeric",
});

export default function ShowtimeCard({ time }: ShowtimeCardProps) {
  return (
    <button className="btn-accent h-10 w-20 rounded font-bold text-base-100">
      {dateFormatter.format(time)}
    </button>
  );
}
