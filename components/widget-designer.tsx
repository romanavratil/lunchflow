"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Clock, Palette, Layout, CheckCircle2, Loader2,
  AlignLeft, AlignRight, Circle, Square, Minus,
  Maximize2, PanelBottomOpen, Zap
} from "lucide-react";
import { WidgetConfig, DEFAULT_WIDGET_CONFIG } from "@/lib/types";
import { TimeInput } from "@/components/ui/time-input";

interface WidgetDesignerProps {
  restaurantId: string;
  restaurantName: string;
}

const THEMES = [
  { id: "light", label: "Light", bg: "#ffffff", text: "#111111", accent: "#6366f1" },
  { id: "dark",  label: "Dark",  bg: "#18181b", text: "#f4f4f5", accent: "#818cf8" },
  { id: "branded", label: "Branded", bg: "#1a1a2e", text: "#e2e8f0", accent: "#c9a84c" },
] as const;

const RADIUS_OPTIONS = [
  { id: "sharp",   label: "Sharp",   icon: <Square className="h-4 w-4" /> },
  { id: "rounded", label: "Rounded", icon: <Circle className="h-4 w-4" /> },
  { id: "pill",    label: "Pill",    icon: <Minus className="h-4 w-4" /> },
] as const;

const ACCENT_PRESETS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#1a1a2e",
];

// Fake menu items for preview
const PREVIEW_MAINS = [
  { name: "Grilled Sea Bass", price: "$28", soldOut: false },
  { name: "Mushroom Risotto", price: "$22", soldOut: false },
  { name: "Duck Confit",      price: "$32", soldOut: true  },
];

function px(radId: WidgetConfig["borderRadius"]) {
  return { sharp: "0px", rounded: "14px", pill: "24px" }[radId];
}

function bgLuminance(hex: string): number {
  const h = hex.replace("#", "");
  if (h.length !== 6) return 1;
  const r = parseInt(h.slice(0,2),16)/255, g = parseInt(h.slice(2,4),16)/255, b = parseInt(h.slice(4,6),16)/255;
  const lin = (c: number) => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}

function ModalPreview({ cfg, name }: { cfg: WidgetConfig; name: string; currency?: string }) {
  const r = px(cfg.borderRadius);
  const isDark = bgLuminance(cfg.modalBg) < 0.35;
  const subText = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const border  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const itemBg  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <div
      className="overflow-hidden shadow-2xl transition-all duration-200"
      style={{
        background: cfg.modalBg,
        color: cfg.modalText,
        borderRadius: r,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        width: 300,
        marginLeft: cfg.fabPosition === "bottom-left" ? 0 : "auto",
        marginRight: cfg.fabPosition === "bottom-left" ? "auto" : 0,
      }}
    >

      {/* header */}
      <div style={{ padding: "12px 20px 8px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: cfg.modalText }}>{name}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: subText, marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </div>
      </div>

      <div style={{ height: 1, background: border, margin: "0 20px 12px" }} />

      {/* soup */}
      <div style={{ margin: "0 20px 12px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: subText, marginBottom: 7, fontWeight: 700 }}>
          Soup of the Day
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", background: itemBg, borderRadius: `calc(${r} / 1.5)`, gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, fontStyle: "italic", color: cfg.modalText }}>Roasted Tomato Bisque</div>
        </div>
      </div>

      {/* mains */}
      <div style={{ margin: "0 20px 16px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: subText, marginBottom: 7, fontWeight: 700 }}>
          Main Courses
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {PREVIEW_MAINS.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 13px",
                background: itemBg,
                borderRadius: `calc(${r} / 1.5)`,
                marginBottom: 7,
                gap: 10,
                opacity: item.soldOut ? 0.42 : 1,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: cfg.modalText, textDecoration: item.soldOut ? "line-through" : "none" }}>
                  {item.name}
                </div>
                {item.soldOut && (
                  <div style={{ fontSize: 9, color: "#dc2626", fontWeight: 700, background: "#fee2e2", padding: "2px 6px", borderRadius: 20, marginTop: 2, display: "inline-block" }}>SOLD OUT</div>
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: cfg.modalAccent, whiteSpace: "nowrap" }}>
                {item.price}{cfg.currency ? `\u00a0${cfg.currency}` : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "8px 20px 14px", borderTop: `1px solid ${border}` }}>
        <div style={{ fontSize: 10, color: subText, textAlign: "center" }}>Powered by LunchFlow</div>
      </div>
    </div>
  );
}

function FabPreview({ cfg }: { cfg: WidgetConfig }) {
  const r = px(cfg.borderRadius);
  return (
    <div
      className="inline-flex items-center gap-2 text-white text-sm font-semibold shadow-lg transition-all duration-200"
      style={{ background: cfg.fabColor, borderRadius: r, padding: "11px 20px" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><line x1="7" y1="2" x2="7" y2="22"/>
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>
      {cfg.fabLabel || "Today's Menu"}
    </div>
  );
}

export function WidgetDesigner({ restaurantId, restaurantName }: WidgetDesignerProps) {
  const [cfg, setCfg]     = useState<WidgetConfig>(DEFAULT_WIDGET_CONFIG);
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);
  const [loading, setLoading]   = useState(true);
  const [scheduleOn, setScheduleOn] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}/widget-config`)
      .then(r => r.json())
      .then((data: WidgetConfig) => {
        setCfg(data);
        const hasSchedule = data.showFrom !== "00:00" || data.showUntil !== "23:59";
        setScheduleOn(hasSchedule);
      })
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const set = useCallback(<K extends keyof WidgetConfig>(k: K, v: WidgetConfig[K]) => {
    setCfg(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  }, []);

  const applyTheme = (t: typeof THEMES[number]) => {
    setCfg(prev => ({
      ...prev,
      theme: t.id,
      modalBg: t.bg,
      modalText: t.text,
      modalAccent: t.accent,
      fabColor: t.accent,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...cfg,
      showFrom:  scheduleOn ? cfg.showFrom  : "00:00",
      showUntil: scheduleOn ? cfg.showUntil : "23:59",
    };
    await fetch(`/api/restaurants/${restaurantId}/widget-config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">

      {/* ── Left: controls ── */}
      <div className="space-y-7">

        {/* ── Schedule ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <Clock className="h-4 w-4 text-indigo-500" />
            Show Schedule
          </div>

          <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Only show during certain hours</p>
              <p className="text-xs text-zinc-500 mt-0.5">Outside these hours the FAB is hidden</p>
            </div>
            <Switch checked={scheduleOn} onCheckedChange={setScheduleOn} />
          </div>

          {scheduleOn && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  Show from
                </Label>
                <TimeInput value={cfg.showFrom} onChange={v => set("showFrom", v)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  Hide after
                </Label>
                <TimeInput value={cfg.showUntil} onChange={v => set("showUntil", v)} />
              </div>
            </div>
          )}
        </section>

        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {/* ── Theme presets ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <Palette className="h-4 w-4 text-indigo-500" />
            Theme
          </div>

          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTheme(t)}
                className={`rounded-xl p-3 border-2 text-left transition-all ${
                  cfg.theme === t.id
                    ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                }`}
                style={{ background: t.bg }}
              >
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: t.text }}
                >
                  {t.label}
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.text, opacity: 0.6 }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {/* ── Colors ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <Palette className="h-4 w-4 text-indigo-500" />
            Colors
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Accent */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Accent</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ACCENT_PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => { set("modalAccent", c); set("fabColor", c); }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      cfg.modalAccent === c ? "border-zinc-900 dark:border-white scale-110" : "border-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={cfg.modalAccent}
                  onChange={e => { set("modalAccent", e.target.value); set("fabColor", e.target.value); }}
                  className="h-8 w-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={cfg.modalAccent}
                  onChange={e => { set("modalAccent", e.target.value); set("fabColor", e.target.value); }}
                  className="h-8 font-mono text-xs flex-1"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Modal background */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Background</Label>
              <div className="flex items-center gap-2 mt-8">
                <input
                  type="color"
                  value={cfg.modalBg}
                  onChange={e => set("modalBg", e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={cfg.modalBg}
                  onChange={e => set("modalBg", e.target.value)}
                  className="h-8 font-mono text-xs flex-1"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Text color */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Text</Label>
              <div className="flex items-center gap-2 mt-8">
                <input
                  type="color"
                  value={cfg.modalText}
                  onChange={e => set("modalText", e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border-0"
                />
                <Input
                  value={cfg.modalText}
                  onChange={e => set("modalText", e.target.value)}
                  className="h-8 font-mono text-xs flex-1"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {/* ── Layout ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <Layout className="h-4 w-4 text-indigo-500" />
            Layout & Button
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Button label */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Button Label</Label>
              <Input
                value={cfg.fabLabel}
                onChange={e => set("fabLabel", e.target.value)}
                placeholder="Today's Menu"
                maxLength={28}
                className="h-10"
              />
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Position</Label>
              <div className="flex gap-2">
                {(["bottom-left", "bottom-right"] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => set("fabPosition", pos)}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm transition-all ${
                      cfg.fabPosition === pos
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium"
                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600"
                    }`}
                  >
                    {pos === "bottom-left" ? <AlignLeft className="h-4 w-4" /> : <AlignRight className="h-4 w-4" />}
                    {pos === "bottom-left" ? "Left" : "Right"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Border radius */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Corner Style</Label>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => set("borderRadius", opt.id)}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm transition-all ${
                    cfg.borderRadius === opt.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px bg-zinc-200 dark:bg-zinc-700" />

        {/* ── Behaviour ── */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <Zap className="h-4 w-4 text-indigo-500" />
            Behaviour
          </div>

          {/* Auto-open */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Auto-open on page load</p>
              <p className="text-xs text-zinc-500 mt-0.5">Panel opens automatically when visitors arrive</p>
            </div>
            <Switch
              checked={cfg.autoOpen}
              onCheckedChange={v => set("autoOpen", v)}
            />
          </div>

          {/* Display mode */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Panel Style</Label>
            <div className="flex gap-2">
              <button
                onClick={() => set("displayMode", "corner")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm transition-all ${
                  cfg.displayMode === "corner"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <PanelBottomOpen className="h-5 w-5" />
                <span className="text-xs">Corner</span>
                <span className="text-[10px] text-zinc-400 font-normal">above button</span>
              </button>
              <button
                onClick={() => set("displayMode", "modal")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm transition-all ${
                  cfg.displayMode === "modal"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <Maximize2 className="h-5 w-5" />
                <span className="text-xs">Modal</span>
                <span className="text-[10px] text-zinc-400 font-normal">centered overlay</span>
              </button>
            </div>
          </div>
        </section>

        {/* Save */}
        <Button
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="h-4 w-4 mr-2" /> Saved!</>
          ) : (
            "Save Widget Settings"
          )}
        </Button>
      </div>

      {/* ── Right: live preview ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Live Preview</p>
          <Badge variant="secondary" className="text-xs">Updates instantly</Badge>
        </div>

        {/* ── Closed state: FAB on page ── */}
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 pl-1">Closed — button on site</p>
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800" style={{ height: 180 }}>
            {/* browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-200 dark:bg-zinc-700 border-b border-zinc-300 dark:border-zinc-600">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="flex-1 mx-3 bg-white dark:bg-zinc-600 rounded text-[9px] text-zinc-400 px-2 py-0.5 text-center">
                therestaurant.com
              </div>
            </div>
            {/* fake content */}
            <div className="p-3 space-y-1.5">
              <div className="h-8 rounded bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-2.5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-600" />
              <div className="h-2.5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-600" />
            </div>
            {/* FAB — absolutely anchored to corner of the mockup */}
            <div className={`absolute bottom-3 ${cfg.fabPosition === "bottom-left" ? "left-3" : "right-3"} transition-all duration-300`}>
              <FabPreview cfg={cfg} />
            </div>
          </div>
        </div>

        {/* ── Open state: floating panel above FAB ── */}
        <div>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 pl-1">Open — panel above button</p>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-3 space-y-2">
            <ModalPreview cfg={cfg} name={restaurantName} currency={cfg.currency} />
            {/* FAB below the panel, same side */}
            <div className={`flex ${cfg.fabPosition === "bottom-left" ? "justify-start" : "justify-end"}`}>
              <FabPreview cfg={cfg} />
            </div>
          </div>
        </div>

        {/* Schedule info */}
        {scheduleOn && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Button visible <strong>{cfg.showFrom}</strong> – <strong>{cfg.showUntil}</strong> daily
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
