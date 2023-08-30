import type { Movie } from "@prisma/client";
import Image from "next/image";
import React from "react";

type MovieHeroProps = {
  movie: Movie;
  altTitle?: string;
  children?: React.ReactNode;
};

export default function MovieHero({
  movie,
  altTitle = "",
  children,
}: MovieHeroProps) {
  return (
    <>
      <header className="relative w-full">
        <div
          style={
            {
              "--image-url": `url(${movie.backdropImage})`,
            } as React.CSSProperties
          }
          className="mx-auto h-72 w-full max-w-7xl bg-gray-600 bg-[image:var(--image-url)] bg-cover bg-center bg-no-repeat bg-blend-multiply"
        ></div>
        <Image
          className="absolute left-8 top-8 h-[288px] rounded md:left-16 lg:left-32"
          src={movie.posterImage}
          width={208}
          height={288}
          alt={`Poster for ${movie.title}`}
        />
      </header>

      <section className="mx-auto w-full max-w-5xl md:flex md:items-stretch">
        <div className="mb-4 mt-10 md:w-96 md:flex-none">
          <h2 className="mb-2 px-8 text-3xl font-bold">
            {altTitle.length > 0 ? altTitle : `${movie.title} at Fake Theater`}
          </h2>
          <p className="px-8">{movie.description}</p>
        </div>
        {children}
      </section>
    </>
  );
}
