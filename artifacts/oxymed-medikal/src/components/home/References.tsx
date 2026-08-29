import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useListReferences } from "@workspace/api-client-react";
import { useI18n } from "../../i18n/I18nProvider";
import { publicMediaUrl } from "../../lib/mediaUrl";

export default function References() {
  const { data, isLoading, isError } = useListReferences({ showInMarquee: true, limit: 100 });
  const items = data?.items ?? [];
  const { t } = useI18n();

  return (
    <section id="referanslar" className="bg-white py-12 sm:py-14">
      <h2 className="text-center text-sm font-extrabold text-oxynavy-950">
        {t("home.references.title")}
      </h2>

      {isError ? (
        <div className="mx-auto mt-8 flex max-w-7xl items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t("home.references.loadError")}
        </div>
      ) : isLoading ? (
        <div className="mt-8 flex gap-5 overflow-hidden px-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[160px] w-[200px] shrink-0 animate-pulse rounded border border-steel-100 bg-steel-100" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <Marquee items={items} />
      ) : null}
    </section>
  );
}

type MarqueeItemData = {
  id: number;
  title: string;
  city?: string | null;
  logoUrl?: string | null;
};

const CARD_W = 200;
const CARD_H = 160;
const CARD_MX = 12;
const TARGET_DURATION_S = 60;
const EASE = 0.055;

function Marquee({ items }: { items: MarqueeItemData[] }) {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ pos: 0, speed: 0, targetSpeed: 0, halfW: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function halfWidth() {
      return track!.scrollWidth / 2;
    }

    const normalSpeed = halfWidth() / (TARGET_DURATION_S * 60);
    stateRef.current = { pos: 0, speed: normalSpeed, targetSpeed: normalSpeed, halfW: halfWidth() };

    function tick() {
      const s = stateRef.current;
      s.halfW = halfWidth();
      s.speed += (s.targetSpeed - s.speed) * EASE;
      s.pos -= s.speed;
      if (s.pos <= -s.halfW) s.pos += s.halfW;
      track!.style.transform = `translate3d(${s.pos}px, 0, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items.length]);

  function onEnter() {
    stateRef.current.targetSpeed = 0;
  }

  function onLeave() {
    const track = trackRef.current;
    if (!track) return;
    stateRef.current.targetSpeed = (track.scrollWidth / 2) / (TARGET_DURATION_S * 60);
  }

  function handleCardClick(e: React.MouseEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/referanslar");
  }

  const doubled = [...items, ...items];

  return (
    <div
      className="mt-8 overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        ref={trackRef}
        className="flex w-max"
        style={{ willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <Link
            key={`${item.id}-${i}`}
            to="/referanslar"
            onClick={handleCardClick}
            className="mx-1.5 flex shrink-0 flex-col items-center justify-center rounded border border-steel-100 bg-white px-4 shadow-[0_4px_14px_rgba(2,20,35,0.045)] transition hover:border-oxynavy-200 hover:shadow-[0_6px_18px_rgba(2,20,35,0.08)]"
            style={{ width: CARD_W, height: CARD_H }}
            aria-label={item.title}
          >
            {item.logoUrl ? (
              <img
                src={publicMediaUrl(item.logoUrl)}
                alt={item.title}
                className="max-h-[120px] max-w-[168px] object-contain"
                draggable={false}
              />
            ) : (
              <>
                <p className="text-center text-[13px] font-extrabold leading-tight text-oxynavy-800">
                  {item.title}
                </p>
                {item.city && (
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-steel-500">
                    {item.city}
                  </p>
                )}
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
