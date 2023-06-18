import type { Movie } from "@prisma/client";
import Image from "next/image";
import React from "react";

type MovieHeroProps = {
  movie: Movie;
  altTitle?: string;
};

export default function MovieHero({ movie, altTitle = "" }: MovieHeroProps) {
  return (
    <header className="relative">
      <div
        style={
          {
            "--image-url": `url(${movie.backdropImage})`,
          } as React.CSSProperties
        }
        className="h-72 w-full max-w-7xl bg-gray-500 bg-[image:var(--image-url)] bg-cover bg-center bg-no-repeat bg-blend-multiply"
      ></div>
      <figure className="">
        <Image
          className="absolute left-8 top-8 h-[288px] rounded"
          src={movie.posterImage}
          width={208}
          height={288}
          alt={`Poster for ${movie.title}`}
        />
        <figcaption className="mt-20 px-8">
          <h2 className="text-3xl font-bold">
            {altTitle.length > 0 ? altTitle : `${movie.title} at Fake Theater`}
          </h2>
          <p>{movie.description}</p>
        </figcaption>
      </figure>
    </header>
  );
}
