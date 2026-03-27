"use client";

import { useState, useEffect, useCallback } from "react";
import { MenuUpload } from "@/components/menu-upload";
import { MenuEditor } from "@/components/menu-editor";
import { WeeklyMenuUpload } from "@/components/weekly-menu-upload";
import { ParsedMenu } from "@/lib/types";
import { Sparkles, CheckCircle2, CalendarDays, ChevronLeft, ChevronRight, Copy } from "lucide-react";

// ── Date helpers ─────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  // "YYYY-MM-DD" in local time
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMondayOf(d: Date): Date {
  const day = d.getDay(); // 0=Sun
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

// ── Types ────────────────────────────────────────────────────────────────────

interface SavedMenu {
  id: string;
  date: string;
  soup: string | null;
  soupPrice: string | null;
  mains: { name: string; price: string; soldOut: boolean }[];
  isPublished: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function MenuSection({
  restaurantId,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const [currency, setCurrency] = useState("");
  const [weekStart, setWeekStart] = useState<Date>(getMondayOf(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekMenus, setWeekMenus] = useState<Record<string, SavedMenu>>({});
  const [menu, setMenu] = useState<ParsedMenu>({ soup: null, soupPrice: null, mains: [] });
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const days = getWeekDays(weekStart);
  const selectedStr = toDateStr(selectedDate);

  // Load all menus for the visible week
  const loadWeek = useCallback(async () => {
    if (!restaurantId) return;
    const from = toDateStr(days[0]);
    const to   = toDateStr(days[6]);
    const res  = await fetch(
      `/api/restaurants/${restaurantId}/menus?from=${from}&to=${to}`
    );
    if (!res.ok) return;
    const list: SavedMenu[] = await res.json();
    const map: Record<string, SavedMenu> = {};
    list.forEach((m) => {
      map[toDateStr(new Date(m.date))] = m;
    });
    setWeekMenus(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, weekStart]);

  useEffect(() => { loadWeek(); }, [loadWeek]);

  useEffect(() => {
    if (!restaurantId) return;
    fetch(`/api/restaurants/${restaurantId}/widget-config`)
      .then((r) => r.json())
      .then((cfg) => { if (cfg.currency) setCurrency(cfg.currency); })
      .catch(() => {});
  }, [restaurantId]);

  // When selected day changes, load that day's menu into the editor
  useEffect(() => {
    const saved = weekMenus[selectedStr];
    if (saved) {
      setMenu({ soup: saved.soup, soupPrice: saved.soupPrice ?? null, mains: saved.mains });
    } else {
      setMenu({ soup: null, soupPrice: null, mains: [] });
    }
  }, [selectedStr, weekMenus]);

  const handleSave = async (data: ParsedMenu, publish: boolean) => {
    if (!restaurantId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isPublished: publish, date: selectedStr }),
      });
      const saved: SavedMenu = await res.json();
      setWeekMenus((prev) => ({ ...prev, [selectedStr]: saved }));
      setJustSaved(selectedStr);
      setTimeout(() => setJustSaved(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  const [copying, setCopying] = useState(false);

  const handleCopyPrev = async () => {
    setCopying(true);
    try {
      // Look back up to 14 days for the most recent saved menu before selectedDate
      const lookbackDate = new Date(selectedDate);
      lookbackDate.setDate(lookbackDate.getDate() - 14);
      const from = toDateStr(lookbackDate);
      // to = day before selectedDate
      const dayBefore = new Date(selectedDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const to = toDateStr(dayBefore);

      const res = await fetch(`/api/restaurants/${restaurantId}/menus?from=${from}&to=${to}`);
      if (!res.ok) return;
      const list: SavedMenu[] = await res.json();
      if (!list.length) return;
      // Most recent comes last (ordered asc), take the last item
      const prev = list[list.length - 1];
      setMenu({ soup: prev.soup, soupPrice: prev.soupPrice ?? null, mains: prev.mains });
    } finally {
      setCopying(false);
    }
  };

  const handleSaveAllWeek = async (days: Partial<Record<string, ParsedMenu>>) => {
    const DAY_OFFSETS: Record<string, number> = {
      monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
      friday: 4, saturday: 5, sunday: 6,
    };
    // Find the Monday of the currently viewed week
    const monday = new Date(weekStart);
    await Promise.all(
      Object.entries(days).map(async ([dayKey, dayMenu]) => {
        if (!dayMenu) return;
        const offset = DAY_OFFSETS[dayKey] ?? 0;
        const date = new Date(monday);
        date.setDate(monday.getDate() + offset);
        const dateStr = toDateStr(date);
        await fetch(`/api/restaurants/${restaurantId}/menus`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...dayMenu, isPublished: false, date: dateStr }),
        });
      })
    );
    // Reload the week so day dots update
    await loadWeek();
  };

  function prevWeek() {
    setWeekStart((w) => {
      const d = new Date(w);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function nextWeek() {
    setWeekStart((w) => {
      const d = new Date(w);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  const savedForSelected = weekMenus[selectedStr];
  const selectedFmt = selectedDate.toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  // Week label
  const weekLabel = (() => {
    const s = days[0];
    const e = days[6];
    if (s.getMonth() === e.getMonth())
      return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  })();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* ── Week strip ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <span className="text-[14px] font-semibold text-gray-900">Weekly Planner</span>
            <span className="text-[12px] text-gray-400 ml-1">{weekLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevWeek}
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
              onClick={nextWeek}
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
                  isSelected ? "text-indigo-500" : isWeekend ? "text-gray-400" : "text-gray-400"
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

                {/* Status dot */}
                <div className="h-4 flex items-center justify-center">
                  {saved ? (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      saved.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
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

      {/* ── Editor area ─────────────────────────────────────────────────── */}
      {(justSaved === selectedStr || savedForSelected?.isPublished) && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[13px] font-medium">
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          {savedForSelected?.isPublished
            ? `${selectedFmt} menu is live in the widget`
            : `${selectedFmt} menu saved as draft`}
        </div>
      )}

      {/* ── Weekly AI import ────────────────────────────────────────────── */}
      <WeeklyMenuUpload onSaveAll={handleSaveAllWeek} currency={currency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Upload */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-gray-900">AI Import</h2>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">{selectedFmt}</span>
            </div>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Photo of chalkboard, printed menu, or handwritten note
            </p>
          </div>
          <div className="p-5">
            <MenuUpload
              onParsed={(parsed) => setMenu(parsed)}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-gray-900">Edit &amp; Publish</h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400 font-medium">{selectedFmt}</span>
                <button
                  onClick={handleCopyPrev}
                  disabled={copying}
                  title="Copy most recent previous menu into this day"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition disabled:opacity-40"
                >
                  <Copy className="h-3 w-3" />
                  {copying ? "Copying…" : "Copy prev day"}
                </button>
              </div>
            </div>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Review items, adjust prices, toggle sold-out
            </p>
          </div>
          <div className="p-5">
            <MenuEditor
              menu={menu}
              onChange={setMenu}
              onSave={handleSave}
              saving={saving}
              currency={currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
