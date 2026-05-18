'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-red-500/20 rounded-full"></div>
          <h1 className="text-9xl font-black text-slate-200 dark:text-slate-800 relative italic">500</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Oops! Error</h2>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            We&apos;ve encountered an unexpected problem.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Don&apos;t worry, our team has been notified. You can try refreshing the page or head back to the dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => reset()}
            size="lg"
            className="flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
