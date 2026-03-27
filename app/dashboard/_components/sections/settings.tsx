"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Settings, Copy, Check, Save, Loader2, Building2, Key, Palette, DollarSign, MapPin } from "lucide-react";
import { WidgetConfig, DEFAULT_WIDGET_CONFIG } from "@/lib/types";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

function AddressAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (address: string, lat: string, lon: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback((q: string) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`, {
      headers: { "Accept-Language": "en" },
    })
      .then(r => r.json())
      .then((results: NominatimResult[]) => {
        setSuggestions(results);
        setOpen(results.length > 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 400);
  }

  function handlePick(r: NominatimResult) {
    onSelect(r.display_name, r.lat, r.lon);
    setSuggestions([]);
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing an address…"
          autoComplete="off"
          className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 animate-spin" />
        )}
      </div>
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handlePick(r)}
                className="w-full text-left px-3.5 py-2.5 text-[13px] text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-start gap-2"
              >
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const CURRENCY_PRESETS = [
  { label: "Kč", value: "Kč" },
  { label: "€",  value: "€"  },
  { label: "$",  value: "$"  },
  { label: "£",  value: "£"  },
  { label: "zł", value: "zł" },
  { label: "Ft", value: "Ft" },
  { label: "₺",  value: "₺"  },
  { label: "₽",  value: "₽"  },
];

export function SettingsSection({
  restaurantId,
  restaurantName: initialName,
  brandingColor: initialColor,
}: {
  restaurantId: string;
  restaurantName: string;
  brandingColor: string;
}) {
  const { data: session } = useSession();
  const [name, setName]       = useState(initialName);
  const [color, setColor]     = useState(initialColor);
  const [currency, setCurrency] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude]   = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [copied, setCopied]     = useState(false);

  // Load existing widget config to get saved currency
  useEffect(() => {
    if (!restaurantId) return;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((r) => r.json())
      .then((r: { address?: string; latitude?: number; longitude?: number }) => {
        if (r.address) setAddress(r.address);
        if (r.latitude != null) setLatitude(String(r.latitude));
        if (r.longitude != null) setLongitude(String(r.longitude));
      })
      .catch(() => {});
    fetch(`/api/restaurants/${restaurantId}/widget-config`)
      .then((r) => r.json())
      .then((cfg: WidgetConfig) => {
        setCurrency(cfg.currency ?? DEFAULT_WIDGET_CONFIG.currency);
      })
      .catch(() => {});
  }, [restaurantId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    try {
      // Save name + branding color + location
      await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brandingColor: color,
          address,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        }),
      });
      // Save currency into widget config
      const cfgRes = await fetch(`/api/restaurants/${restaurantId}/widget-config`);
      const existingCfg: WidgetConfig = await cfgRes.json();
      await fetch(`/api/restaurants/${restaurantId}/widget-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...existingCfg, currency }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function copyId() {
    navigator.clipboard.writeText(restaurantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Restaurant settings */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-0.5">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <h2 className="text-[14px] font-semibold text-gray-900">Restaurant</h2>
          </div>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5">
              Restaurant name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              Branding color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer p-1"
              />
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Currency
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CURRENCY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setCurrency(p.value)}
                  className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-semibold transition ${
                    currency === p.value
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "border-gray-200 text-gray-700 hover:border-indigo-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="Or type custom…"
              maxLength={8}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
            />
            <p className="text-[11px] text-gray-400 mt-1">Shown next to prices in the widget</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Address (shown on map)
            </label>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={(addr, lat, lon) => {
                setAddress(addr);
                setLatitude(lat);
                setLongitude(lon);
              }}
            />
            {latitude && longitude && (
              <p className="text-[11px] text-gray-400 mt-1.5 font-mono">
                {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)}
              </p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : saved ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saved ? "Saved!" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-0.5">
            <Settings className="h-4 w-4 text-indigo-500" />
            <h2 className="text-[14px] font-semibold text-gray-900">Account</h2>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <div className="text-[12px] font-medium text-gray-400 mb-1">Signed in as</div>
            <div className="text-[14px] text-gray-800">{session?.user?.email}</div>
          </div>
        </div>
      </div>

      {/* Restaurant ID */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-0.5">
            <Key className="h-4 w-4 text-indigo-500" />
            <h2 className="text-[14px] font-semibold text-gray-900">Restaurant ID</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Used in your widget embed snippet
          </p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[12px] text-gray-600 font-mono truncate">
              {restaurantId}
            </code>
            <button
              onClick={copyId}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
