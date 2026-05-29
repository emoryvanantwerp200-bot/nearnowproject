import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.nearnow.mobile",
  appName: "NearNow",
  webDir: "www",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https"
  }
};

export default config;
