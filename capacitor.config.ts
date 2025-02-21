import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aakarvisual.app",
  appName: "Rockstar Painting",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    url: "https://aakarvisual.vercel.app",
    cleartext: true,
  },
};

export default config;
