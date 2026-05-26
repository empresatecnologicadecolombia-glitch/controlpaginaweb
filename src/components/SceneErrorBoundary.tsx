import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SceneErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 bg-black px-6 text-center">
          <p className="font-display text-sm text-primary">No se pudo cargar la escena 3D</p>
          <p className="max-w-md text-xs text-muted-foreground">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-lg border border-primary/40 px-4 py-2 text-xs text-primary"
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
