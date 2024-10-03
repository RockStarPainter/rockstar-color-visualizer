import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import "/styles/globals.css";
import type { AppProps } from "next/app";
import * as ort from "onnxruntime-web";
import { useEffect, useState } from "react";
import AppContextProvider from "../utils/hooks/context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";
import { ColorProvider } from "../contexts/ColorContext";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";

export default function App({ Component, pageProps }: AppProps) {
  const [model, setModel] = useState<ort.InferenceSession | null>();
  const [vithModel, setVithModel] = useState<ort.InferenceSession | null>();
  useEffect(() => {
    const initmodel = async () => {
      const session = await ort.InferenceSession.create(
        "./_next/static/chunks/pages/sam_vit_b_decoder.onnx",
        {
          executionProviders: ["wasm"],
        }
      );
      const vithsession = await ort.InferenceSession.create(
        "./_next/static/chunks/pages/sam_vit_h_decoder.onnx",
        {
          executionProviders: ["wasm"],
        }
      );
      console.log("model loaded", session, vithsession);
      setVithModel(vithsession);
      setModel(session);
    };
    initmodel();
  }, []);
  return (
    <>
      <AppContextProvider>
        <ColorProvider>
          <>
            <ToastContainer
              position="bottom-left"
              progressStyle={{ visibility: "hidden" }}
              autoClose={1000}
            />

            <NavBar />

            <Component {...pageProps} model={model} vithModel={vithModel} />
            <Analytics />

            <Footer />
          </>
        </ColorProvider>
      </AppContextProvider>
    </>
  );
}
