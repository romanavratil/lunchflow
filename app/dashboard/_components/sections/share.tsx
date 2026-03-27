"use client";

import { useState, useEffect, useCallback } from "react";
import { SocialCardPreview } from "@/components/social-card-preview";
import { MenuItem } from "@/lib/types";
import { ImageIcon, CalendarDays, ChevronLeft, ChevronRight, QrCode, Download, ExternalLink } from "lucide-react";

// ── QR Code card ─────────────────────────────────────────────────────────────

function QrCard({ restaurantId }: { restaurantId: string }) {
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    setMenuUrl(window.location.origin + "/menu/" + restaurantId);
  }, [restaurantId]);

  if (!menuUrl) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&format=svg&data=${encodeURIComponent(menuUrl)}`;
  const qrDownload = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&format=png&data=${encodeURIComponent(menuUrl)}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-0.5">
          <QrCode className="h-4 w-4 text-indigo-500" />
          <h2 className="text-[14px] font-semibold text-gray-900">QR Code</h2>
        </div>
        <p className="text-[12px] text-gray-400 mt-0.5">
          Print on tables, receipts or front door — opens today&apos;s menu directly
        </p>
      </div>
      <div className="p-5 flex gap-6 items-center">
        {/* QR image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="QR code"
          width={120}
          height={120}
          className="rounded-xl border border-gray-100 shrink-0"
        />
        <div className="space-y-3 flex-1 min-w-0">
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-1">Menu URL</p>
            <code className="block text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 truncate font-mono">
              {menuUrl}
            </code>
          </div>
          <div className="flex gap-2">
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
            <a
              href={qrDownload}
              download="lunchflow-qr.png"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-[12px] font-medium text-white transition"
            >
              <Download className="h-3.5 w-3.5" />
              Download PNG
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Date helpers (same as menu.tsx) ──────────────────────────────────────────

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedMenu {
  id: string;
  date: string;
  soup: string | null;
  soupPrice: string | null;
  mains: MenuItem[];
  isPublished: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ShareSection({
  restaurantId,
  restaurantName,
  brandingColor: initialBrandingColor,
}: {
  restaurantId: string;
  restaurantName: string;
  brandingColor: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const [brandingColor, setBrandingColor] = useState(initialBrandingColor);
  const [weekStart, setWeekStart] = useState<Date>(getMondayOf(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekMenus, setWeekMenus] = useState<Record<string, SavedMenu>>({})

  const days = getWeekDays(weekStart);
  const selectedStr = toDateStr(selectedDate);
  const selectedMenu = weekMenus[selectedStr] ?? null;

  const loadWeek = useCallback(async () => {
    if (!restaurantId) return;
    const from = toDateStr(days[0]);
    const to   = toDateStr(days[6]);
    const res  = await fetch(`/api/restaurants/${restaurantId}/menus?from=${from}&to=${to}`);
    if (!res.ok) return;
    const list: SavedMenu[] = await res.json();
    const map: Record<string, SavedMenu> = {};
    list.forEach((m) => { map[toDateStr(new Date(m.date))] = m; });
    setWeekMenus(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, weekStart]);

  useEffect(() => { loadWeek(); }, [loadWeek]);

  // Fetch live branding color so it reflects the latest saved value
  useEffect(() => {
    if (!restaurantId) return;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => r.json())
      .then((data) => { if (data.brandingColor) setBrandingColor(data.brandingColor); })
      .catch(() => {});
  }, [restaurantId]);

  const weekLabel = (() => {
    const s = days[0];
    const e = days[6];
    if (s.getMonth() === e.getMonth())
      return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  })();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* ── Week strip ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <span className="text-[14px] font-semibold text-gray-900">Pick a day</span>
            <span className="text-[12px] text-gray-400 ml-1">{weekLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; })}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setWeekStart(getMondayOf(today)); setSelectedDate(today); }}
              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              Today
            </button>
            <button
              onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; })}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex divide-x divide-gray-100">
          {days.map((day, i) => {
            const ds = toDateStr(day);
            const saved = weekMenus[ds];
            const isToday = ds === todayStr;
            const isSelected = ds === selectedStr;
            const isWeekend = i >= 5;

            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(day)}
                className={`
                  flex-1 flex flex-col items-center gap-1.5 py-3.5 px-1 transition-all relative
                  ${isSelected
                    ? "bg-indigo-50"
                    : isWeekend
                    ? "bg-gray-50/60 hover:bg-gray-100/60"
                    : "hover:bg-gray-50"
                  }
                `}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isSelected ? "text-indigo-500" : "text-gray-400"
                }`}>
                  {DAY_SHORT[i]}
                </span>

                <span className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold
                  ${isSelected && isToday ? "bg-indigo-500 text-white" :
                    isSelected ? "bg-indigo-100 text-indigo-700" :
                    isToday ? "bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-400/40" :
                    isWeekend ? "text-gray-400" : "text-gray-700"}
                `}>
                  {day.getDate()}
                </span>

                <div className="h-4 flex items-center justify-center">
                  {saved ? (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      saved.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {saved.isPublished ? "Live" : "Draft"}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  )}
                </div>

                {isSelected && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-indigo-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Card or empty state ─────────────────────────────────────────── */}
      {selectedMenu ? (
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden w-full max-w-sm">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-0.5">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-gray-900">Export for Social</h2>
              </div>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · Story (9:16) or Post (1:1)
              </p>
            </div>
            <div className="p-5">
              <SocialCardPreview
                menuId={selectedMenu.id}
                restaurantName={restaurantName}
                brandingColor={brandingColor}
                soup={selectedMenu.soup}
                mains={selectedMenu.mains}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-12 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-gray-600">No menu for this day</p>
            <p className="text-[12px] text-gray-400 mt-1">
              Save a menu in <span className="font-semibold text-gray-500">Today&apos;s Menu</span> first, then come back here to export it
            </p>
          </div>
        </div>
      )}

      {/* QR Code card */}
      <QrCard restaurantId={restaurantId} />
    </div>
  );
}
