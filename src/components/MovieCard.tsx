import ShowtimeCard from "./ShowtimeCard";

export default function MovieCard() {
  return (
    <section className="mx-8 flex flex-col gap-4 rounded-lg bg-neutral p-8">
      <header className="text-base-100">
        <div className="mx-auto h-72 w-52 bg-base-100 text-neutral">
          movie img
        </div>
        <h3 className="text-4xl font-bold">[movie title]</h3>
      </header>
      <section>
        <h4 className="text-base-100">Matinee Showtimes</h4>
        <ShowtimeCard time={new Date()} />
      </section>
      <section>
        <h4 className="text-base-100">Regular Showtimes</h4>
      </section>
      <footer className="text-base-100">
        <p>More Info</p>
      </footer>
    </section>
  );
}
