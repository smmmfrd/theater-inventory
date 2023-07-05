import Link from "next/link";
import React from "react";

export default function AboutPage() {
  return (
    <>
      <header className="px-8">
        <h2 className="mt-4 text-2xl font-bold underline">About</h2>
      </header>

      <section className="flex flex-col gap-8 px-12 [&>*]:leading-7">
        <p>
          This website is a fake movie theater modeled after my local theater's
          site, where they have live updating ticket sales.
        </p>
        <p>
          Feel free to make any order you want for any showtime found on the
          main page. Any order can also be deleted from the orders page at any
          time.
        </p>
        <p>
          <Link
            className="link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/smmmfrd/theater-inventory"
          >
            Link to the repository...
          </Link>
        </p>
        <p>
          Site deploys through{" "}
          <Link
            className="link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://vercel.com/"
          >
            Vercel
          </Link>{" "}
          and was scaffolded with the{" "}
          <Link
            className="link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://create.t3.gg/"
          >
            T3 stack.
          </Link>
        </p>
        <p>
          Automated random orders and a weekly reset are done through{" "}
          <Link
            className="link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://vercel.com/docs/cron-jobs"
          >
            cron jobs on Vercel.
          </Link>{" "}
          Every night each showtime gets a random number of tickets ordered for
          it, from 2 to (currently) 15% of the maximum number of seats left.
        </p>
      </section>
    </>
  );
}
