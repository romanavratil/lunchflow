"use client";

import { useState, useEffect } from "react";
import { BarChart2, Eye, TrendingUp, Calendar } from "lucide-react";
import { AnalyticsSkeleton } from "../skeletons";

interface AnalyticsData {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  daily: { date: string; count: number }[];
}

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AnalyticsSection({ restaurantId }: { restaurantId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/restaurants/${restaurantId}/analytics`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message ?? "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (loading) return <AnalyticsSkeleton />;

  if (error) return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">
        Failed to load analytics: {error}
      </div>
    </div>
  );

  if (!data) return null;

  // Last 14 days for the bar chart (more readable than 30)
  const chartDays = data.daily.slice(-14);
  const maxCount = Math.max(...chartDays.map((d) => d.count), 1);

  const statCards = [
    { label: "Today", value: data.todayCount, icon: Eye, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Last 7 days", value: data.weekCount, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Last 30 days", value: data.monthCount, icon: Calendar, color: "text-violet-500", bg: "bg-violet-50" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-4.5 w-4.5 ${color}`} />
            </div>
            <div className="text-[28px] font-bold text-gray-900 leading-none">{value}</div>
            <div className="text-[12px] text-gray-400 mt-1 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart — last 14 days */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-indigo-500" />
            <h2 className="text-[14px] font-semibold text-gray-900">Widget opens — last 14 days</h2>
          </div>
        </div>
        <div className="p-5">
          {data.monthCount === 0 ? (
            <div className="py-10 text-center text-[13px] text-gray-400">
              No opens recorded yet. Data appears once visitors start opening the widget.
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {chartDays.map(({ date, count }) => {
                const d = new Date(date + "T12:00:00Z");
                const heightPct = (count / maxCount) * 100;
                const isToday = date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {count}
                    </div>
                    {/* Bar */}
                    <div className="w-full flex items-end" style={{ height: 96 }}>
                      <div
                        className={`w-full rounded-t-md transition-all ${isToday ? "bg-indigo-500" : "bg-indigo-200 group-hover:bg-indigo-400"}`}
                        style={{ height: `${Math.max(heightPct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    {/* Day label */}
                    <div className={`text-[9px] font-semibold uppercase tracking-wide ${isToday ? "text-indigo-500" : "text-gray-400"}`}>
                      {DAY_ABBR[d.getUTCDay()]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
