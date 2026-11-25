'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="p-8 text-center">
      <h1 className="text-xl font-bold">Something went wrong.</h1>
      <button className="mt-4 underline" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
