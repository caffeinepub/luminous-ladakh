import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
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

// CRITICAL: LanguageProvider MUST wrap the entire app here.
// Do NOT remove it — removing it breaks the Continue button on the language
// selection screen and crashes navigation throughout the app.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
