"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { ParsedMenu } from "@/lib/types";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
type DayKey = typeof DAYS[number];
const DAY_LABEL: Record<DayKey, string> = {
  monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu",
  friday:"Fri", saturday:"Sat", sunday:"Sun",
};

type DayMenu = { soup: string | null; soupPrice: string | null; mains: { name: string; price: string; soldOut: boolean }[] };
type WeekResult = Partial<Record<DayKey, DayMenu>>;

interface WeeklyMenuUploadProps {
  /** Called when user confirms — provides a map of day→ParsedMenu to batch-save */
  onSaveAll: (days: Partial<Record<DayKey, ParsedMenu>>) => Promise<void>;
  currency?: string;
}

export function WeeklyMenuUpload({ onSaveAll, currency }: WeeklyMenuUploadProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeekResult | null>(null);
  const [savedDays, setSavedDays] = useState<DayKey[]>([]);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setSavedDays([]);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/parse-menu-week", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Parse failed");
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg",".jpeg",".png",".webp",".heic"] },
    maxFiles: 1,
    disabled: loading,
  });

  const parsedDays = result ? (Object.keys(result) as DayKey[]).filter(d => result[d] && (result[d]!.mains.length > 0 || result[d]!.soup)) : [];

  const handleSaveAll = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const payload: Partial<Record<DayKey, ParsedMenu>> = {};
      for (const day of parsedDays) {
        const m = result[day]!;
        payload[day] = { soup: m.soup ?? null, soupPrice: m.soupPrice ?? null, mains: m.mains };
      }
      await onSaveAll(payload);
      setSavedDays(parsedDays);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 pt-4 pb-4 flex items-center justify-between hover:bg-gray-50/60 transition"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-[14px] font-semibold text-gray-900">AI Import — Whole Week</span>
          <span className="text-[11px] text-gray-400 font-normal">Upload a weekly menu photo</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 gap-3 cursor-pointer transition
              ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"}
              ${loading ? "opacity-60 pointer-events-none" : ""}
            `}
          >
            <input {...getInputProps()} />
            {loading ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                <p className="text-[13px] font-medium text-gray-500">Parsing weekly menu with AI…</p>
              </>
            ) : (
              <>
                <Upload className="h-7 w-7 text-indigo-400" />
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-gray-700">
                    {isDragActive ? "Drop it here" : "Drop your weekly menu here"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Chalkboard, printed sheet, or photo with all days visible</p>
                </div>
              </>
            )}
          </div>

          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          {/* Results preview */}
          {result && parsedDays.length > 0 && (
            <div className="space-y-3">
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
                AI found menus for {parsedDays.length} day{parsedDays.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {parsedDays.map((day) => {
                  const m = result[day]!;
                  const isSaved = savedDays.includes(day);
                  return (
                    <div key={day} className={`rounded-xl border px-4 py-3 ${isSaved ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[12px] font-bold uppercase tracking-wider ${isSaved ? "text-green-600" : "text-indigo-500"}`}>
                          {DAY_LABEL[day]}
                        </span>
                        {isSaved && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                      </div>
                      <div className="space-y-0.5">
                        {m.soup && (
                          <p className="text-[12px] text-gray-500 italic">
                            Soup: {m.soup}{m.soupPrice ? ` — ${m.soupPrice}${currency ? `\u00a0${currency}` : ""}` : ""}
                          </p>
                        )}
                        {m.mains.map((item, i) => (
                          <p key={i} className="text-[12px] text-gray-700">
                            {item.name}
                            {item.price && <span className="text-gray-400"> — {item.price}{currency ? `\u00a0${currency}` : ""}</span>}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {savedDays.length === parsedDays.length ? (
                <div className="flex items-center gap-2 text-[13px] font-medium text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  All days saved as drafts — review and publish each day above
                </div>
              ) : (
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {saving ? "Saving…" : `Save all ${parsedDays.length} days as drafts`}
                </button>
              )}
            </div>
          )}

          {result && parsedDays.length === 0 && !loading && (
            <p className="text-[13px] text-gray-400 text-center py-4">
              AI couldn&apos;t identify any days. Try a clearer photo with day labels visible.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
