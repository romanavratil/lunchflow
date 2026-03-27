"use client";

import { createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  UtensilsCrossed,
  Megaphone,
  Share2,
  Wand2,
  Settings,
  LogOut,
  Menu,
  ChefHat,
  BarChart2,
} from "lucide-react";
import { useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  brandingColor: string;
}

const RestaurantContext = createContext<Restaurant>({ id: "", name: "", brandingColor: "#6366f1" });
export const useRestaurant = () => useContext(RestaurantContext);

const NAV = [
  { key: "menu",         href: "/dashboard/menu",         label: "Today's Menu",  icon: UtensilsCrossed, desc: "Import & publish your daily menu" },
  { key: "announcement", href: "/dashboard/announcement", label: "Announcement",  icon: Megaphone,       desc: "Banner message for customers" },
  { key: "share",        href: "/dashboard/share",        label: "Social Share",  icon: Share2,          desc: "Generate social media assets" },
  { key: "widget",       href: "/dashboard/widget",       label: "Widget",        icon: Wand2,           desc: "Customize & embed your widget" },
  { key: "analytics",    href: "/dashboard/analytics",    label: "Analytics",     icon: BarChart2,       desc: "Widget opens & engagement stats" },
  { key: "settings",     href: "/dashboard/settings",     label: "Settings",      icon: Settings,        desc: "Restaurant & account settings" },
];

export function DashboardShell({
  children,
  restaurantId,
  restaurantName,
  brandingColor,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  restaurantId: string;
  restaurantName: string;
  brandingColor: string;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (userName || userEmail || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const activeNav = NAV.find((n) => pathname.startsWith(n.href)) ?? NAV[0];

  return (
    <RestaurantContext.Provider value={{ id: restaurantId, name: restaurantName, brandingColor }}>
      <div className="flex h-screen bg-[#f5f5f7] overflow-hidden">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-60 flex flex-col bg-[#111113] border-r border-white/[0.06]
            transform transition-transform duration-200
            lg:relative lg:translate-x-0
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.06] shrink-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <UtensilsCrossed className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-[15px] tracking-tight">LunchFlow</span>
          </div>

          {/* Restaurant badge */}
          <div className="px-3 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.04]">
              <div className="w-5 h-5 rounded-md bg-indigo-500/20 flex items-center justify-center shrink-0">
                <ChefHat className="h-2.5 w-2.5 text-indigo-400" />
              </div>
              <span className="text-[12px] font-medium text-white/50 truncate">{restaurantName}</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-0.5">
            {NAV.map(({ key, href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium
                    transition-all duration-150
                    ${isActive
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="px-2.5 py-3 border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-semibold text-indigo-300">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white/70 truncate">{userName || "User"}</div>
                <div className="text-[11px] text-white/30 truncate">{userEmail}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Main area ────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center gap-4 px-6 h-14 bg-white border-b border-gray-200/70 shrink-0">
            <button
              className="lg:hidden text-gray-400 hover:text-gray-600 transition"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-[15px] font-semibold text-gray-900 truncate">{activeNav.label}</h1>
              <p className="text-[12px] text-gray-400 leading-none mt-0.5 hidden sm:block">
                {activeNav.desc}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RestaurantContext.Provider>
  );
}

