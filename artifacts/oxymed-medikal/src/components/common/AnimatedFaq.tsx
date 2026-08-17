import { useEffect, useId, useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import "./AnimatedFaq.css";

export type AnimatedFaqItem = {
  question: string;
  answer: string;
};

type AnimatedFaqProps = {
  items: AnimatedFaqItem[];
  className?: string;
  initialOpen?: number | null;
};

export default function AnimatedFaq({ items, className = "", initialOpen = 0 }: AnimatedFaqProps) {
  const idPrefix = useId().replace(/:/g, "");
  const [openItems, setOpenItems] = useState<Set<number>>(
    () => new Set(initialOpen !== null && items.length > 0 ? [initialOpen] : []),
  );

  useEffect(() => {
    setOpenItems((current) => new Set([...current].filter((index) => index < items.length)));
  }, [items.length]);

  function toggle(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className={`oxy-faq-list ${className}`.trim()}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        const triggerId = `${idPrefix}-faq-trigger-${index}`;
        const panelId = `${idPrefix}-faq-panel-${index}`;
        const style = { "--oxy-faq-index": index } as CSSProperties;

        return (
          <article
            className={`oxy-faq-item${isOpen ? " is-open" : ""}`}
            key={`${item.question}-${index}`}
            style={style}
          >
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className="oxy-faq-trigger"
              id={triggerId}
              onClick={() => toggle(index)}
              type="button"
            >
              <span className="oxy-faq-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="oxy-faq-question">{item.question}</span>
              <span className="oxy-faq-icon" aria-hidden="true">
                <ChevronDown />
              </span>
            </button>
            <div
              aria-hidden={!isOpen}
              aria-labelledby={triggerId}
              className="oxy-faq-panel"
              id={panelId}
              role="region"
            >
              <div className="oxy-faq-panel__inner">
                <p>{item.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}