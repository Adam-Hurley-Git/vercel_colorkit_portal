import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">
          There was a problem completing your sign in. This could be due to an expired link or a configuration issue.
        </p>
        <p className="text-sm text-muted-foreground">
          Please try signing in again. If the problem persists, contact support.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Link
            href="/login"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Login Again
          </Link>
          <Link href="/signup" className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
            Go to Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
