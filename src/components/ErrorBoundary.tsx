"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/20 text-sm text-red-400">
            Something went wrong loading this section.{" "}
            <button
              onClick={() => this.setState({ hasError: false })}
              className="underline hover:text-red-300"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
