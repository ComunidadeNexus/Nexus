import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Nexus ErrorBoundary:", error, info.componentStack);
  }

  private handleRecover = () => {
    this.setState({ hasError: false });
    window.location.assign("/comunidade");
  };

  private handleHome = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#030303] text-white flex flex-col items-center justify-center px-6 py-16">
          <img
            src="/logo-nexus.png"
            alt="Nexus"
            className="h-16 w-auto max-w-[200px] object-contain mb-8"
          />
          <h1 className="text-2xl font-bold text-center mb-3">Algo deu errado</h1>
          <p className="text-gray-400 text-center max-w-md mb-8">
            A página travou após um endereço inválido ou um erro inesperado. Você pode voltar para a
            comunidade e continuar de onde parou.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={this.handleRecover}
              className="min-h-11 px-6 py-3 rounded-full font-bold bg-gradient-to-r from-[#00C6FF] to-[#FF007F] text-white"
            >
              Ir para a Comunidade
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              className="min-h-11 px-6 py-3 rounded-full font-bold border border-gray-700 text-gray-200"
            >
              Página inicial
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
