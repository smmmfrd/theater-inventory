import Image from "next/image";
import Link from "next/link";
import ShowtimeCard from "./ShowtimeCard";

export type MovieCardProps = {
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
}: MovieCardProps) {
  return (
    <section className="relative m-8 flex flex-col gap-8 rounded bg-neutral p-8 text-base-content sm:flex-row">
      <header className="top-16 mx-auto max-w-xs basis-1/3 sm:max-w-lg">
        <Link href={`movies/${movieId}`}>
          <Image
            className="mx-auto mb-1"
            src={posterImage}
            height={960}
            width={640}
            alt={`Poster for ${title}`}
          />
          <h3 className="text-3xl font-semibold text-neutral-content">
            {title}
          </h3>
        </Link>
      </header>

      <div className="flex basis-2/3 flex-col justify-between gap-4">
        <ShowtimeCard movieId={movieId} showtimeCount={showtimeCount} />

        <footer className="text-center">
          <Link className="link" href={`movies/${movieId}`}>
            More Info
          </Link>
        </footer>
      </div>
    </section>
  );
}
