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
          <NewTabLink
            link="https://github.com/smmmfrd/theater-inventory"
            text="Link to the repository..."
          />
        </p>
        <p>
          Site deploys through{" "}
          <NewTabLink link="https://vercel.com/" text="Vercel" /> and was
          scaffolded with the{" "}
          <NewTabLink link="https://create.t3.gg/" text="T3 stack" />.
        </p>
        <p>
          Automated random orders and a weekly reset are done through{" "}
          <NewTabLink
            link="https://vercel.com/docs/cron-jobs"
            text="cron jobs on Vercel"
          />
          . Every night each showtime gets a random number of tickets ordered
          for it, from 2 to (currently) 15% of the maximum number of seats left.
        </p>
      </section>
    </>
  );
}

type NewTabLinkProps = {
  link: string;
  text: string;
};

function NewTabLink({ link, text }: NewTabLinkProps) {
  return (
    <Link
      className="link"
      target="_blank"
      rel="noopener noreferrer"
      href={link}
    >
      {text}
    </Link>
  );
}
