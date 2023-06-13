import { type AppType } from "next/app";
import { api } from "~/utils/api";
import Head from "next/head";

import "~/styles/globals.css";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Fake Theater</title>
        <meta name="description" content="Fake Movie Theater Ticket App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex min-h-screen flex-col gap-5">
        <Navbar />
        <Component {...pageProps} />
        {/* Footer is kept here so it's always at the bottom of the screen. */}
        <Footer />
      </main>
    </>
  );
};

export default api.withTRPC(MyApp);
