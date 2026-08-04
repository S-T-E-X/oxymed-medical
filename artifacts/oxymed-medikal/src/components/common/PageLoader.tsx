/**
 * Full-screen animated overlay shown while navigating between pages, kept
 * visible until the destination page's above-the-fold images have finished
 * loading (see RouteTransitionLoader). Images marked loading="lazy" are
 * intentionally excluded from the wait — they load on demand, not up front.
 */
export default function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 bg-white"
      role="status"
      aria-live="polite"
      aria-label="Sayfa yükleniyor"
    >
      <svg
        className="h-16 w-40 sm:h-20 sm:w-52"
        viewBox="0 0 220 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 40 H60 L72 12 L86 68 L98 40 L108 40 L118 24 L128 40 H220"
          stroke="#dce4eb"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="oxy-loader-pulse"
          d="M0 40 H60 L72 12 L86 68 L98 40 L108 40 L118 24 L128 40 H220"
          stroke="#08314a"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
        />
      </svg>
      <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-oxynavy-700/70">
        Yükleniyor
      </span>
    </div>
  );
}
