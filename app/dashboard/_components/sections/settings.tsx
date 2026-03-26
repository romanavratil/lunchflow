"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, Copy, Check, Save, Loader2, Building2, Key, Palette } from "lucide-react";

export function SettingsSection({
  restaurantId,
  restaurantName: initialName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const { data: session } = useSession();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiKey = restaurantId; // using restaurantId as the identifier for the snippet

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId) return;
    setSaving(true);
    try {
      await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brandingColor: color }),
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
