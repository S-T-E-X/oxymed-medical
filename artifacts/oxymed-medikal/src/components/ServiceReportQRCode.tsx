import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function ServiceReportQRCode({
  value,
  size = 28,
}: {
  value: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, {
      errorCorrectionLevel: "M",
      margin: 0,
      width: size * 4,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).catch(() => {
      /* invalid value */
    });
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: `${size}mm`,
        height: `${size}mm`,
        imageRendering: "pixelated",
      }}
    />
  );
}
