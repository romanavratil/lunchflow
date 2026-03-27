"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MenuItem, WidgetConfig, DEFAULT_WIDGET_CONFIG } from "@/lib/types";

export interface BrowseRestaurant {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
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

function RestaurantCard({
  r,
  selected,
  onClick,
}: {
  r: BrowseRestaurant;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg: WidgetConfig = { ...DEFAULT_WIDGET_CONFIG, ...(r.widgetConfig as Partial<WidgetConfig>) };
  const accent = cfg.modalAccent || r.brandingColor || "#6366f1";
  const currency = cfg.currency || "";
  const menu = r.menus[0];
  const mains = (menu?.mains ?? []) as MenuItem[];
  const dark = luminance(accent) < 0.35;
  const onAcc = dark ? "#fff" : "#111";

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: selected ? `2px solid ${accent}` : "2px solid transparent",
        boxShadow: selected ? `0 0 0 3px ${accent}22, 0 4px 20px rgba(0,0,0,.08)` : "0 2px 8px rgba(0,0,0,.05)",
        background: "#fff",
        cursor: "pointer",
        transition: "all .18s",
        marginBottom: 10,
      }}
    >
      {/* Accent header */}
      <div style={{ background: accent, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: onAcc, letterSpacing: "-.02em" }}>{r.name}</div>
          {r.address && (
            <div style={{ fontSize: 10, color: onAcc, opacity: .65, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
              {r.address.split(",").slice(0, 2).join(",")}
            </div>
          )}
        </div>
        {menu ? (
          <div style={{ fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,.22)", color: onAcc, padding: "3px 8px", borderRadius: 20, letterSpacing: ".06em", flexShrink: 0 }}>
            OPEN
          </div>
        ) : (
          <div style={{ fontSize: 9, fontWeight: 700, background: "rgba(0,0,0,.15)", color: onAcc, padding: "3px 8px", borderRadius: 20, letterSpacing: ".06em", flexShrink: 0, opacity: .7 }}>
            NO MENU
          </div>
        )}
      </div>

      {/* Body */}
      {menu && (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {menu.soup && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 4 }}>Soup</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, fontStyle: "italic", color: "#374151" }}>{menu.soup}</span>
                {menu.soupPrice && <span style={{ fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0 }}>{menu.soupPrice}{currency ? ` ${currency}` : ""}</span>}
              </div>
            </div>
          )}
          {mains.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {mains.slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, opacity: item.soldOut ? .45 : 1 }}>
                  <span style={{ fontSize: 12, color: "#1f2937", fontWeight: 500, textDecoration: item.soldOut ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.name}
                  </span>
                  {item.price && <span style={{ fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0 }}>{item.price}{currency ? ` ${currency}` : ""}</span>}
                </div>
              ))}
              {mains.length > 3 && <div style={{ fontSize: 11, color: "#9ca3af" }}>+{mains.length - 3} more</div>}
            </div>
          )}
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 8, display: "flex", justifyContent: "flex-end" }}>
            <Link
              href={`/menu/${r.id}`}
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 11, fontWeight: 700, color: accent, textDecoration: "none" }}
            >
              Full menu →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function MapPanel({
  restaurants,
  selectedId,
  onSelect,
}: {
  restaurants: BrowseRestaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const withCoords = restaurants.filter(r => r.latitude && r.longitude);

    import("leaflet").then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const center: [number, number] = withCoords.length > 0
        ? [withCoords[0].latitude!, withCoords[0].longitude!]
        : [50.0755, 14.4378];

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(center, 14);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      withCoords.forEach((r) => {
        const accent = r.brandingColor || "#6366f1";
        const dark = luminance(accent) < 0.35;
        const textColor = dark ? "#fff" : "#111";
        const hasMenu = r.menus.length > 0;

        const icon = L.divIcon({
          html: `<div style="
            background:${accent};color:${textColor};
            padding:5px 11px;border-radius:20px;
            font-size:11px;font-weight:700;font-family:-apple-system,sans-serif;
            white-space:nowrap;
            box-shadow:0 3px 14px rgba(0,0,0,.28);
            border:2px solid rgba(255,255,255,.7);
            cursor:pointer;
            opacity:${hasMenu ? 1 : 0.5};
            transition:transform .15s,box-shadow .15s;
          ">${r.name}</div>`,
          className: "",
          iconAnchor: [0, 0],
        });

        const marker = L.marker([r.latitude!, r.longitude!], { icon })
          .addTo(map)
          .on("click", () => onSelect(r.id));

        markersRef.current[r.id] = marker;
      });

      if (withCoords.length > 1) {
        const bounds = L.latLngBounds(withCoords.map(r => [r.latitude!, r.longitude!]));
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to selected
  useEffect(() => {
    if (!selectedId || !mapInstance.current) return;
    const r = restaurants.find(r => r.id === selectedId);
    if (r?.latitude && r?.longitude) {
      mapInstance.current.flyTo([r.latitude, r.longitude], 16, { duration: 0.6 });
    }
  }, [selectedId, restaurants]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default function BrowseClient({
  restaurants,
  today,
}: {
  restaurants: BrowseRestaurant[];
  today: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const withMenu = restaurants.filter(r => r.menus.length > 0);

  function handleSelect(id: string) {
    setSelectedId(id);
    // Scroll card into view
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0EDEA", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#E85D04", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#1A1A1A", letterSpacing: "-.03em" }}>LunchFlow</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{withMenu.length} open today · {today}</span>
        </div>
        <Link href="/auth/signup" style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#E85D04", padding: "7px 14px", borderRadius: 8, textDecoration: "none" }}>
          Add your restaurant
        </Link>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left: listings */}
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid #F0EDEA", background: "#FDFAF7" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #F0EDEA", background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF" }}>
              {restaurants.length} restaurants
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
            {restaurants.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 16px", color: "#9CA3AF", fontSize: 13 }}>
                No restaurants yet
              </div>
            ) : (
              restaurants.map(r => (
                <div key={r.id} ref={el => { cardRefs.current[r.id] = el; }}>
                  <RestaurantCard
                    r={r}
                    selected={selectedId === r.id}
                    onClick={() => handleSelect(r.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: map */}
        <div style={{ flex: 1, position: "relative" }}>
          {restaurants.filter(r => r.latitude && r.longitude).length === 0 ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, background: "#F9F9F9", color: "#9CA3AF" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p style={{ fontSize: 14, fontWeight: 600 }}>No map coordinates yet</p>
              <p style={{ fontSize: 12 }}>Restaurants can add their address in Settings</p>
            </div>
          ) : (
            <MapPanel
              restaurants={restaurants}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          )}
        </div>

      </div>
    </div>
  );
}
