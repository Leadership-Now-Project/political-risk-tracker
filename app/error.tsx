'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-navy dark:text-cream mb-4">
          Something went wrong
        </h2>
        <p className="text-navy/70 dark:text-cream/70 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gold text-navy font-medium rounded-lg hover:bg-gold-dark transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
