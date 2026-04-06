import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
// CRITICAL: LanguageProvider MUST be here — DO NOT REMOVE
// Removing this causes the Continue button to silently fail and the app breaks
import { LanguageProvider } from "./context/LanguageContext";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      {/* CRITICAL: LanguageProvider wraps App — DO NOT REMOVE — Continue button depends on this */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
