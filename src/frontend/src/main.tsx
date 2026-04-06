import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// CRITICAL: LanguageProvider MUST wrap App — DO NOT REMOVE THIS IMPORT/USAGE
// Removing it breaks the Continue button and causes crashes on language screen
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import { LanguageProvider } from "./context/LanguageContext";

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
      {/* CRITICAL: LanguageProvider must stay here — see comment above */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
