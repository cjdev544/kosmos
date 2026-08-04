import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { App } from "./app/app";
import "./styles/global.css";

// registerType: "autoUpdate" makes this reload the page on its own once a
// new service worker activates — no user prompt. Browsers only check the SW
// script for changes on navigation/roughly every 24h on their own, which is
// too slow for an installed PWA reopened from the background without a real
// navigation — so also check explicitly whenever the app becomes visible
// again and hourly as a fallback for a tab left open continuously.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void registration.update();
    });
    setInterval(() => void registration.update(), 60 * 60 * 1000);
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
