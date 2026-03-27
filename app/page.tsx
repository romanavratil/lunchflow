import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DEFAULT_WIDGET_CONFIG, WidgetConfig, MenuItem } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "LunchFlow — Today's Lunch Menus",
  description: "Find today's lunch menu from local restaurants, or list your restaurant for free.",
};

async function getRestaurantsWithMenus() {
  const todayStart = new Date(); todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setUTCHours(23, 59, 59, 999);
  return prisma.restaurant.findMany({
    where: { menus: { some: { date: { gte: todayStart, lte: todayEnd }, isPublished: true } } },
    include: { menus: { where: { date: { gte: todayStart, lte: todayEnd }, isPublished: true }, take: 1 } },
    orderBy: { name: "asc" },
  });
}

function luminance(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 1;
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const l = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b);
}

export default async function LandingPage() {
  const restaurants = await getRestaurantsWithMenus();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        .fade-1 { animation: fadeUp .5s .05s both }
        .fade-2 { animation: fadeUp .5s .15s both }
        .fade-3 { animation: fadeUp .5s .25s both }
        .dot-live { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite }
        .menu-card { transition: box-shadow .2s, transform .2s }
        .menu-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,.1); transform: translateY(-2px) }
        .step-icon { transition: background .2s }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(255,255,255,.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #F0EDEA",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#E85D04", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l19-9-9 19-2-8-8-2z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#1A1A1A", letterSpacing: "-.03em" }}>LunchFlow</span>
          </Link>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="#menus" style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", padding: "6px 12px", borderRadius: 8, textDecoration: "none" }}>
              Browse menus
            </a>
            <a href="#for-restaurants" style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", padding: "6px 12px", borderRadius: 8, textDecoration: "none" }}>
              For restaurants
            </a>
            <Link href="/auth/signin" style={{ fontSize: 13, fontWeight: 500, color: "#6B7280", padding: "6px 12px", borderRadius: 8, textDecoration: "none" }}>
              Sign in
            </Link>
            <Link href="/auth/signup" style={{
              fontSize: 13, fontWeight: 700, color: "#fff",
              background: "#E85D04", padding: "8px 16px", borderRadius: 8,
              textDecoration: "none", cursor: "pointer",
            }}>
              Add your restaurant
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 100, paddingBottom: 64, background: "#FDFAF7" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 20, overflow: "hidden", border: "1px solid #E8E3DD" }}>

            {/* Left: For diners */}
            <div className="fade-1" style={{ padding: "56px 48px", background: "#fff" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEF3EC", color: "#E85D04", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, marginBottom: 20, letterSpacing: ".08em", textTransform: "uppercase" }}>
                <span className="dot-live" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                Live today · {today}
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 900, color: "#1A1A1A", letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 16 }}>
                Find today&apos;s<br />lunch menu
              </h1>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 28, maxWidth: 340 }}>
                Browse daily specials from local restaurants, updated fresh every morning.
              </p>
              <a href="#menus" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#1A1A1A", color: "#fff", fontWeight: 700, fontSize: 14,
                padding: "12px 22px", borderRadius: 10, textDecoration: "none", cursor: "pointer",
              }}>
                Browse today&apos;s menus
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <div style={{ marginTop: 20, fontSize: 12, color: "#9CA3AF" }}>
                {restaurants.length > 0 ? (
                  <span>
                    <strong style={{ color: "#22C55E" }}>{restaurants.length}</strong> restaurant{restaurants.length !== 1 ? "s" : ""} live right now
                  </span>
                ) : (
                  <span>Check back at lunch time</span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 1, background: "#E8E3DD", zIndex: 1 }} />
            </div>

            {/* Right: For restaurants */}
            <div className="fade-2" style={{ padding: "56px 48px", background: "#FDF6F2", gridColumn: "2", gridRow: "1" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEF3EC", color: "#E85D04", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, marginBottom: 20, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Free to join
              </div>
              <h2 style={{ fontSize: 40, fontWeight: 900, color: "#1A1A1A", letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 16 }}>
                List your<br />restaurant
              </h2>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 28, maxWidth: 340 }}>
                Post your daily menu in 30 seconds. Appear here, on your website, and on social — no tech skills needed.
              </p>
              <Link href="/auth/signup" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#E85D04", color: "#fff", fontWeight: 700, fontSize: 14,
                padding: "12px 22px", borderRadius: 10, textDecoration: "none", cursor: "pointer",
              }}>
                Add your restaurant — free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
                {["No credit card", "2-min setup", "Any website"].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9CA3AF" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {t}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LIVE MENUS ──────────────────────────────────────────────────── */}
      <section id="menus" style={{ background: "#fff", padding: "64px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="dot-live" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#9CA3AF" }}>Live today</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A1A", letterSpacing: "-.03em" }}>
                Today&apos;s lunch menus
              </h2>
            </div>
            {restaurants.length > 0 && (
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", background: "#F3F4F6", padding: "6px 12px", borderRadius: 100 }}>
                {restaurants.length} open today
              </div>
            )}
          </div>

          {/* Cards */}
          {restaurants.length === 0 ? (
            <div style={{ background: "#F9F9F9", borderRadius: 16, border: "1px solid #E5E7EB", padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#9CA3AF" }}>No menus posted yet today</p>
              <p style={{ fontSize: 13, color: "#D1D5DB", marginTop: 4 }}>Come back at lunch time</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {restaurants.map((r) => {
                const menu = r.menus[0];
                const cfg: WidgetConfig = { ...DEFAULT_WIDGET_CONFIG, ...(r.widgetConfig as Partial<WidgetConfig>) };
                const accent = cfg.modalAccent || r.brandingColor || "#E85D04";
                const currency = cfg.currency || "";
                const mains = (menu?.mains ?? []) as unknown as MenuItem[];
                const dark = luminance(accent) < 0.35;
                const onAcc = dark ? "#fff" : "#1A1A1A";

                return (
                  <Link key={r.id} href={`/menu/${r.id}`} className="menu-card" style={{
                    background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB",
                    overflow: "hidden", display: "flex", flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,.04)", textDecoration: "none",
                    cursor: "pointer",
                  }}>
                    {/* Header strip */}
                    <div style={{ background: accent, padding: "14px 18px" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: onAcc, letterSpacing: "-.02em" }}>{r.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: onAcc, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 2 }}>Today&apos;s Menu</div>
                    </div>

                    {/* Body */}
                    <div style={{ flex: 1, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {menu?.soup && (
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 5 }}>Soup</div>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <span style={{ fontSize: 13, fontStyle: "italic", color: "#374151" }}>{menu.soup}</span>
                            {menu.soupPrice && <span style={{ fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0 }}>{menu.soupPrice}{currency ? ` ${currency}` : ""}</span>}
                          </div>
                        </div>
                      )}
                      {mains.length > 0 && (
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 6 }}>Mains</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {mains.slice(0, 4).map((item, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, opacity: item.soldOut ? .45 : 1 }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1F2937", lineHeight: 1.3, textDecoration: item.soldOut ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                                </div>
                                {item.price && <span style={{ fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0 }}>{item.price}{currency ? ` ${currency}` : ""}</span>}
                              </div>
                            ))}
                            {mains.length > 4 && <div style={{ fontSize: 11, color: "#9CA3AF" }}>+{mains.length - 4} more</div>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: "10px 18px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFAFA" }}>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{mains.length} dish{mains.length !== 1 ? "es" : ""}{menu?.soup ? " + soup" : ""}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>View full menu →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── FOR RESTAURANTS ─────────────────────────────────────────────── */}
      <section id="for-restaurants" style={{ background: "#FDFAF7", padding: "80px 0", borderTop: "1px solid #F0EDEA" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          {/* Heading */}
          <div style={{ maxWidth: 520, marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#E85D04", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>For restaurants</div>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: "#1A1A1A", letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 14 }}>
              Post your daily menu in 30 seconds
            </h2>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7 }}>
              Your menu appears on this directory, on your website, and as a social card — all from one place.
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }}>
            {[
              {
                n: "01",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
                  </svg>
                ),
                title: "Add your menu",
                desc: "Type items, paste text, or upload a photo. AI extracts everything for you.",
              },
              {
                n: "02",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                  </svg>
                ),
                title: "Review and publish",
                desc: "Edit any detail, mark sold-out items, then hit Publish. Goes live instantly.",
              },
              {
                n: "03",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E85D04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
                  </svg>
                ),
                title: "Reach your customers",
                desc: "Your website widget, social cards, and this directory all update automatically.",
              },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} style={{
                background: "#fff", border: "1px solid #E8E3DD", borderRadius: 14, padding: "24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: "#FEF3EC",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#D1D5DB", letterSpacing: ".1em", alignSelf: "center" }}>{n}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA bar */}
          <div style={{
            background: "#1A1A1A", borderRadius: 16, padding: "32px 40px",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-.03em", marginBottom: 4 }}>Ready to get started?</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)" }}>Free forever. No credit card. Cancel anytime.</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/auth/signup" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#E85D04", color: "#fff", fontWeight: 700, fontSize: 14,
                padding: "12px 22px", borderRadius: 10, textDecoration: "none", cursor: "pointer",
              }}>
                Create free account
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/auth/signin" style={{
                display: "inline-flex", alignItems: "center",
                background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.7)", fontWeight: 600, fontSize: 14,
                padding: "12px 22px", borderRadius: 10, textDecoration: "none", cursor: "pointer",
              }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "#F9F9F9", borderTop: "1px solid #F0EDEA", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#E85D04", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l19-9-9 19-2-8-8-2z"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1A1A1A", letterSpacing: "-.02em" }}>LunchFlow</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Browse menus", "#menus"], ["For restaurants", "#for-restaurants"], ["Sign in", "/auth/signin"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none" }}>
                {label}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#D1D5DB" }}>© {new Date().getFullYear()} LunchFlow</p>
        </div>
      </footer>
    </>
  );
}
