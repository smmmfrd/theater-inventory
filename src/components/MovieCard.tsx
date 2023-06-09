import Image from "next/image";
import Link from "next/link";
import ShowtimeCard from "./ShowtimeCard";

export type MovieCardType = {
  movieId: number;
  title: string;
  posterImage: string;
  showtimeCount: number;
};

export default function MovieCard({
  movieId,
  title,
  posterImage,
  showtimeCount,
}: MovieCardType) {
  return (
    <section className="relative mx-8 flex max-w-3xl flex-col gap-4 rounded bg-neutral p-8 sm:flex-row sm:pr-4 md:mx-auto">
      <header className="top-16 mx-auto h-min max-w-[208px] flex-none text-base-100 sm:sticky">
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

      <div className="flex flex-grow flex-col justify-between gap-4">
        <ShowtimeCard movieId={movieId} showtimeCount={showtimeCount} />

        <footer className="text-center text-base-100">
          <Link className="link" href={`movies/${movieId}`}>
            More Info
          </Link>
        </footer>
      </div>
    </section>
  );
}
