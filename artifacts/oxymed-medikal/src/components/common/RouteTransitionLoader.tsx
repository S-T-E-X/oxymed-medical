import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageLoader from "./PageLoader";

// Safety ceiling so the overlay can never get stuck if an image errors out
// or a slow network never resolves.
const MAX_WAIT_MS = 4000;

/**
 * Shows an animated overlay while navigating between pages (not on the very
 * first page load) and keeps it up until the destination page's
 * above-the-fold images ("eager" <img> elements) have finished loading.
 * Images marked loading="lazy" are skipped on purpose — they are meant to
 * load later, as the user scrolls to them.
 */
export default function RouteTransitionLoader() {
  const location = useLocation();
  const [trackedPath, setTrackedPath] = useState(location.pathname);
  const [isLoading, setIsLoading] = useState(false);

  // Detected during render (React's "adjust state on prop change" pattern):
  // flips isLoading on before the new route's content is painted, avoiding a
  // flash of unloaded content underneath.
  if (location.pathname !== trackedPath) {
    setTrackedPath(location.pathname);
    setIsLoading(true);
  }

  useEffect(() => {
    if (!isLoading) return;

    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    // Wait a tick so the newly-routed page has committed its DOM before we
    // scan it for images.
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;

      const images = Array.from(document.images).filter(
        (img) => img.getAttribute("loading") !== "lazy",
      );

      const pending = images.filter((img) => !img.complete);

      if (pending.length === 0) {
        setIsLoading(false);
        return;
      }

      let remaining = pending.length;
      const finish = () => {
        remaining -= 1;
        if (remaining <= 0 && !cancelled) {
          setIsLoading(false);
        }
      };

      pending.forEach((img) => {
        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", finish, { once: true });
      });

      timers.push(
        setTimeout(() => {
          if (!cancelled) setIsLoading(false);
        }, MAX_WAIT_MS),
      );
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [isLoading, trackedPath]);

  if (!isLoading) return null;
  return <PageLoader />;
}
