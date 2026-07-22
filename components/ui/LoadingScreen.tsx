type LoadingScreenProps = {
  title: string;
  message: string;
};

/**
 * Full-screen branded loading state - same spinner styling as the app's
 * initial auth-check screen (app/page.tsx). Used to surface short pieces of
 * training guidance (how much to train, how heavy to train) while a route
 * that has nothing to actually fetch briefly transitions in, instead of a
 * blank flash.
 */
export default function LoadingScreen({ title, message }: LoadingScreenProps) {
  return (
    <main
      role="status"
      aria-label="Loading"
      className="flex min-h-screen flex-col items-center justify-center gap-5 bg-black px-8 text-center text-white"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />

      <div className="max-w-[300px]">
        <p className="text-xs font-semibold uppercase tracking-wide text-lime-400">
          {title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{message}</p>
      </div>
    </main>
  );
}
