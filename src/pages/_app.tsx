import { type AppType } from "next/app";
import { api } from "~/utils/api";
import Head from "next/head";

import "~/styles/globals.css";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Navbar />
      <main className="bg-base grid min-h-screen grid-cols-[repeat(auto-fit,minmax(512px,1fr))] pt-96">
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
};

export default api.withTRPC(MyApp);
