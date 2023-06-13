import Image from "next/image";
import Link from "next/link";
import ShowtimeCard from "./ShowtimeCard";

// Reminder: this is just the display card, just need the title, id, and image right now, you should adjust the query for this.

export type MovieCardType = {
  movieId: number;
  title: string;
  posterImage: string;
};

export default function MovieCard({
  movieId,
  title,
  posterImage,
}: MovieCardType) {
  return (
    <section className="mx-8 flex flex-col gap-4 rounded bg-neutral p-8">
      <header className="text-base-100">
        <Image
          className="mx-auto mb-2"
          src={posterImage}
          width={208}
          height={288}
          alt={`Poster for ${title}`}
        />
        <h3 className="text-3xl font-bold">{title}</h3>
      </header>

      <ShowtimeCard movieId={movieId} />

      <footer className="text-base-100">
        <Link className="link" href={`movies/${movieId}`}>
          More Info
        </Link>
      </footer>
    </section>
  );
}
