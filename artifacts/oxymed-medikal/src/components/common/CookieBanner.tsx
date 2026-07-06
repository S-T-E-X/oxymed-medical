import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "oxymed_cookie_consent";

export default function CookieBanner() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  // Never show on admin or print pages
  const isAdmin = location.pathname.startsWith("/admin");
  const isPrint =
    location.pathname.startsWith("/teklif-goruntule") ||
    location.pathname.startsWith("/servis-raporu") ||
    location.pathname.startsWith("/taslak");

  if (!visible || isAdmin || isPrint) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    // Notify the visitor tracker so the current (landing) page view is captured immediately.
    window.dispatchEvent(new Event("oxymed-consent-accepted"));
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Çerez bildirimi"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "0 0 env(safe-area-inset-bottom)",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: "900px",
          padding: "20px 24px",
          marginBottom: "20px",
          borderRadius: "14px",
          background: "#ffffff",
          boxShadow: "0 8px 40px rgba(2,20,35,0.14), 0 0 0 1px rgba(2,20,35,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: "26px", flexShrink: 0, lineHeight: 1 }}>🍪</span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: "220px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 600,
              color: "#041d31",
              lineHeight: 1.5,
            }}
          >
            Bu site deneyiminizi iyileştirmek için çerezler kullanmaktadır.
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#576773",
              lineHeight: 1.5,
            }}
          >
            Site işlevselliği ve performans analizi için gerekli çerezler kullanılmaktadır.
            Devam ederek çerez politikamızı kabul etmiş sayılırsınız.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              border: "1.5px solid #dce4eb",
              background: "transparent",
              color: "#576773",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#3d4b56";
              (e.target as HTMLButtonElement).style.color = "#041d31";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#dce4eb";
              (e.target as HTMLButtonElement).style.color = "#576773";
            }}
          >
            Reddet
          </button>
          <button
            onClick={accept}
            style={{
              padding: "9px 22px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #1c5a77 0%, #08314a 100%)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(8,49,74,0.25)",
              transition: "opacity 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = "0.88")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = "1")
            }
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
