'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">
              Something went wrong
            </h2>
            <p className="text-navy/70 mb-6">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-amber-500 text-navy font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
