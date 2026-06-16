import { Component, ErrorInfo, ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error | undefined }> {
  state: { hasError: boolean; error?: Error | undefined } = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-[#faf7f3]">
          <div className="text-center">
            <h2 className="text-2xl font-light text-[#1c1410] mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Algo deu errado
            </h2>
            <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false })} className="px-4 py-2 bg-[#c9a96e] text-white rounded text-sm">
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
