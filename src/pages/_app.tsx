import { type AppType } from "next/app";
import { api } from "~/utils/api";
import Head from "next/head";

import "~/styles/globals.css";
import Link from "next/link";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Fake Theater</title>
        <meta name="description" content="Fake Movie Theater Ticket App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="">
        <Link href="/">
          <h1>Fake Theater</h1>
        </Link>
      </nav>
      <main className="flex min-h-screen flex-col">
        <Component {...pageProps} />
        <footer className="">copy right joe brandon</footer>
      </main>
    </>
  );
};

export default api.withTRPC(MyApp);
