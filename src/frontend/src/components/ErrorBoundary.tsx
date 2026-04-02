import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  minimal?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      if (this.props.minimal) {
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-zinc-900 rounded-xl border border-zinc-700 text-center">
            <span className="material-symbols-outlined text-amber-400 text-3xl mb-2">
              warning
            </span>
            <p className="text-zinc-300 text-sm mb-3">
              This section encountered an error.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition-colors"
            >
              Retry
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <img
              src="/assets/ladakh-connect-logo.png"
              alt="Ladakh Connect"
              className="w-16 h-16 mx-auto mb-4 rounded-2xl opacity-80"
            />
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/15 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-red-400 text-3xl">
                error
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-zinc-400 text-sm mb-6">
              The app ran into an unexpected error. Your data is safe — try
              refreshing to continue.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
              >
                🔄 Try Again
              </button>
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors text-sm"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
