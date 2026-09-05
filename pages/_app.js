import Head from "next/head";
import { MetaPixelScript } from "../components/MetaPixel";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <MetaPixelScript />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
