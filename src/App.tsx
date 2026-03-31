import { Suspense, lazy } from "react";

const EVMap = lazy(() => import("./components/EVMap"));

export function MapLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
          EVolver
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Loading map</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Preparing the latest verified Chinese EV presence data and interactive
          map view.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <EVMap />
    </Suspense>
  );
}
