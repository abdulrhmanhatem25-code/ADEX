import { Component } from "react";
import { RefreshCw } from "lucide-react";

/**
 * ErrorBoundary — catches any unhandled React render errors
 * and shows a friendly fallback instead of a white screen.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production, send to an error monitoring service (e.g. Sentry)
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-slate-800">Something went wrong</h1>
                        <p className="text-slate-500 text-sm max-w-sm">
                            An unexpected error occurred. Please reload the page or go back to the home screen.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="mt-3 text-left text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 max-w-xl overflow-auto">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Go to Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
