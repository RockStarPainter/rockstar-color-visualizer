import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import "/styles/globals.css";
import type { AppProps } from "next/app";
import * as ort from "onnxruntime-web";
import { useEffect, useState } from "react";
import AppContextProvider from "../utils/hooks/context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";
import { ColorProvider } from "../contexts/ColorContext";
import NavBar from "../components/NavBar/NavBar";
import Footer from "../components/Footer/Footer";
// Import the Loading component
import { useRouter } from "next/router"; // Import the useRouter hook
import Loading from "../components/Loading/Loading";

export default function App({ Component, pageProps }: AppProps) {
  const [model, setModel] = useState<ort.InferenceSession | null>(null);
  const [vithModel, setVithModel] = useState<ort.InferenceSession | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter(); // Use the router

  useEffect(() => {
    const initmodel = async () => {
      try {
        // Artificial delay for demonstration purposes
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Load models
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
        console.log("Model loaded", session, vithsession);
        setVithModel(vithsession);
        setModel(session);
        setLoading(false); // Stop showing loading when models are ready
      } catch (error) {
        console.error("Error loading models:", error);
        setLoading(false); // Ensure loading stops even if there's an error
      }
    };

    initmodel();
  }, []);

  // Listen for route change events
  useEffect(() => {
    const handleStart = () => {
      setLoading(true); // Start loading when route changes
    };
    const handleComplete = () => {
      setLoading(false); // Stop loading when route changes complete
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete); // In case of errors

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router.events]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <AppContextProvider>
          <ColorProvider>
            <>
              <ToastContainer
                position="top-right"
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
      )}{" "}
      {/* Show loading screen during initial load and route changes */}
    </>
  );
}
