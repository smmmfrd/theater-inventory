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
    <section className="mx-8 flex max-w-3xl flex-col gap-4 rounded bg-neutral p-8 sm:flex-row sm:pr-4 md:mx-auto">
      <header className="max-w-[208px] flex-none text-base-100">
        <Link href={`movies/${movieId}`}>
          <Image
            className="mx-auto mb-1"
            src={posterImage}
            width={208}
            height={288}
            alt={`Poster for ${title}`}
          />
          <h3 className="text-2xl font-semibold">{title}</h3>
        </Link>
      </header>

      <div className="flex flex-col justify-between gap-4">
        <ShowtimeCard movieId={movieId} />

        <footer className="text-center text-base-100">
          <Link className="link" href={`movies/${movieId}`}>
            More Info
          </Link>
        </footer>
      </div>
    </section>
  );
}
