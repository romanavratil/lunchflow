"use client";

import { useEffect, useRef, useState } from "react";
import { MenuItem, WidgetConfig, DEFAULT_WIDGET_CONFIG } from "@/lib/types";
import Link from "next/link";

interface RestaurantPin {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  brandingColor: string;
  widgetConfig: Record<string, unknown>;
  menus: Array<{
    id: string;
    soup: string | null;
    soupPrice: string | null;
    mains: unknown;
  }>;
}

function luminance(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 1;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const l = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b);
}

function MenuCard({ r, onClose }: { r: RestaurantPin; onClose: () => void }) {
  const cfg: WidgetConfig = { ...DEFAULT_WIDGET_CONFIG, ...(r.widgetConfig as Partial<WidgetConfig>) };
  const accent = cfg.modalAccent || r.brandingColor || "#6366f1";
  const currency = cfg.currency || "";
  const menu = r.menus[0];
  const mains = (menu?.mains ?? []) as MenuItem[];
  const dark = luminance(accent) < 0.35;
  const onAcc = dark ? "#fff" : "#111";

  return (
    <div style={{
      position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
      width: 340, maxWidth: "calc(100vw - 32px)",
      background: "#fff", borderRadius: 20,
      boxShadow: "0 20px 60px rgba(0,0,0,.18), 0 4px 12px rgba(0,0,0,.1)",
      overflow: "hidden", zIndex: 1000,
      animation: "slideUp .25s ease",
    }}>
      {/* Header */}
      <div style={{ background: accent, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: onAcc, letterSpacing: "-.02em" }}>{r.name}</div>
          {r.address && <div style={{ fontSize: 11, color: onAcc, opacity: .6, marginTop: 2 }}>{r.address}</div>}
        </div>
        <button
          onClick={onClose}
          style={{ background: "rgba(255,255,255,.2)", border: "none", color: onAcc, width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}
        >×</button>
      </div>

      {/* Body */}
      {!menu ? (
        <div style={{ padding: "24px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🍽</div>
          <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>No menu posted today</p>
        </div>
      ) : (
        <div style={{ padding: "14px 18px", maxHeight: 260, overflowY: "auto" }}>
          {menu.soup && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" as const, color: "#9ca3af", marginBottom: 6 }}>Soup of the Day</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontStyle: "italic", color: "#4b5563" }}>{menu.soup}</span>
                {menu.soupPrice && <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{menu.soupPrice}{currency ? ` ${currency}` : ""}</span>}
              </div>
            </div>
          )}
          {mains.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" as const, color: "#9ca3af", marginBottom: 8 }}>Main Courses</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mains.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, opacity: item.soldOut ? .5 : 1 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", textDecoration: item.soldOut ? "line-through" : "none" }}>{item.name}</div>
                      {item.soldOut && <span style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "1px 6px", borderRadius: 20, display: "inline-block" }}>SOLD OUT</span>}
                    </div>
                    {item.price && <span style={{ fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0 }}>{item.price}{currency ? ` ${currency}` : ""}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "10px 18px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end" }}>
        <Link href={`/menu/${r.id}`} style={{
          fontSize: 12, fontWeight: 700, color: "#fff",
          background: accent, padding: "7px 16px", borderRadius: 10,
          textDecoration: "none",
        }}>
          Full menu →
        </Link>
      </div>
    </div>
  );
}

export default function MapClient({ restaurants }: { restaurants: RestaurantPin[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<RestaurantPin | null>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const center = restaurants.length > 0
        ? [restaurants[0].latitude, restaurants[0].longitude] as [number, number]
        : [50.0755, 14.4378] as [number, number];

      const map = L.map(mapRef.current!).setView(center, 13);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      restaurants.forEach((r) => {
        const accent = r.brandingColor || "#6366f1";
        const dark = luminance(accent) < 0.35;
        const textColor = dark ? "#fff" : "#111";

        const icon = L.divIcon({
          html: `<div style="
            background:${accent};color:${textColor};
            padding:5px 10px;border-radius:20px;
            font-size:12px;font-weight:700;font-family:-apple-system,sans-serif;
            white-space:nowrap;
            box-shadow:0 3px 12px rgba(0,0,0,.25);
            border:2px solid rgba(255,255,255,.6);
            cursor:pointer;
          ">${r.name}</div>`,
          className: "",
          iconAnchor: [0, 0],
        });

        L.marker([r.latitude, r.longitude], { icon })
          .addTo(map)
          .on("click", () => setSelected(r));
      });

      // Fit all markers if multiple
      if (restaurants.length > 1) {
        const bounds = L.latLngBounds(restaurants.map((r) => [r.latitude, r.longitude]));
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    });

    return () => {
      if (mapInstance.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstance.current as any).remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {selected && <MenuCard r={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
