import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function ServiceReportBarcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width: 1.1,
        height: 20,
        displayValue: false,
        margin: 0,
        background: "transparent",
        lineColor: "#111827",
      });
    } catch {
      // invalid value — leave empty
    }
  }, [value]);

  return (
    <svg
      ref={svgRef}
      className="sr-barcode"
      style={{ display: "block", width: "100%", height: "5.4mm" }}
    />
  );
}
