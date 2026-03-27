import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import MapWrapper from "./MapWrapper";

export const metadata: Metadata = {
  title: "Restaurant Map — LunchFlow",
  description: "Find restaurants near you and see today's lunch menus on the map.",
};

async function getRestaurantsOnMap() {
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setUTCHours(23, 59, 59, 999);

  return prisma.restaurant.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      brandingColor: true,
      widgetConfig: true,
      menus: {
        where: { date: { gte: todayStart, lte: todayEnd }, isPublished: true },
        take: 1,
        select: { id: true, soup: true, soupPrice: true, mains: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export default async function MapPage() {
  const restaurants = await getRestaurantsOnMap();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const withMenu = restaurants.filter((r) => r.menus.length > 0);

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f8fc;color:#111}
        a{text-decoration:none;color:inherit}
        html,body{height:100%}
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* Top bar */}
        <header style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>🍽</div>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#111", letterSpacing: "-.03em" }}>LunchFlow</span>
            </Link>
            <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Restaurant Map</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                {withMenu.length} open today · {today}
              </span>
            </div>
            <Link href="/" style={{
              fontSize: 13, fontWeight: 600, color: "#6366f1",
              background: "#eff0ff", padding: "6px 14px", borderRadius: 10,
            }}>
              ← Back to listings
            </Link>
          </div>
        </header>

        {/* Map + sidebar */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Sidebar */}
          <div style={{
            width: 300,
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#9ca3af" }}>
                {restaurants.length} restaurants on map
              </p>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {restaurants.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>No restaurants on the map yet.</p>
                  <p style={{ fontSize: 12, color: "#d1d5db", marginTop: 4 }}>Add coordinates in your dashboard settings.</p>
                </div>
              ) : (
                restaurants.map((r) => {
                  const hasMenu = r.menus.length > 0;
                  return (
                    <div key={r.id} style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #f9fafb",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: hasMenu ? "#22c55e" : "#d1d5db",
                        marginTop: 4, flexShrink: 0,
                      }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>{r.name}</div>
                        {r.address && <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.address}</div>}
                        <div style={{ fontSize: 11, color: hasMenu ? "#22c55e" : "#d1d5db", fontWeight: 600, marginTop: 2 }}>
                          {hasMenu ? "Menu posted today" : "No menu today"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Map */}
          <div style={{ flex: 1, position: "relative" }}>
            {restaurants.length === 0 ? (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 12,
                background: "#f8f8fc",
              }}>
                <div style={{ fontSize: 48 }}>🗺️</div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#d1d5db" }}>No restaurants with coordinates yet</p>
                <p style={{ fontSize: 13, color: "#d1d5db" }}>Add your address & coordinates in Settings</p>
                <Link href="/dashboard/settings" style={{
                  marginTop: 8,
                  fontSize: 13, fontWeight: 700, color: "#fff",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  padding: "10px 20px", borderRadius: 12,
                }}>
                  Go to Settings →
                </Link>
              </div>
            ) : (
              <MapWrapper restaurants={restaurants as never} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
