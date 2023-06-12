import Image from "next/image";
import ShowtimeCard from "./ShowtimeCard";

// Reminder: this is just the display card, just need the title, id, and image right now, you should adjust the query for this.

type MovieCardType = {
  movieId: number;
  title: string;
  image: string;
};

export default function MovieCard({ movieId, title, image }: MovieCardType) {
  return (
    <section className="mx-8 flex flex-col gap-4 rounded-lg bg-neutral p-8">
      <header className="text-base-100">
        <Image
          className="mx-auto mb-2"
          src={image}
          width={208}
          height={288}
          alt={`Poster for ${title}`}
        />
        <h3 className="text-4xl font-bold">{title}</h3>
      </header>
      <section>
        <h4 className="text-base-100">Matinee Showtimes</h4>
        <ShowtimeCard time={"10:30 PM"} />
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
