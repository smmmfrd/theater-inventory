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
    <section className="relative m-8 flex flex-col gap-8 rounded bg-neutral p-8 text-base-content md:flex-row lg:flex-col">
      <header className="top-16 mx-auto h-min max-w-[208px] flex-none sm:sticky">
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

        <footer className="text-center">
          <Link className="link" href={`movies/${movieId}`}>
            More Info
          </Link>
        </footer>
      </div>
    </section>
  );
}
