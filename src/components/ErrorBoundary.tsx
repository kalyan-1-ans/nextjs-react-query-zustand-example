'use client';
import React from 'react';

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <div role="alert" className="p-8">
          <h1 className="text-xl">Something went wrong.</h1>
          <button className="mt-4 underline" onClick={() => window.location.reload()}>
            Reload application
          </button>
        </div>
      );
    return this.props.children;
  }
}
