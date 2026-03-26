"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

interface AnnouncementData {
  text: string;
  bgColor: string;
  textColor: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface AnnouncementEditorProps {
  restaurantId: string;
}

const PRESET_COLORS = [
  { bg: "#f59e0b", text: "#1a1a1a", label: "Amber" },
  { bg: "#10b981", text: "#ffffff", label: "Emerald" },
  { bg: "#3b82f6", text: "#ffffff", label: "Blue" },
  { bg: "#ef4444", text: "#ffffff", label: "Red" },
  { bg: "#8b5cf6", text: "#ffffff", label: "Purple" },
  { bg: "#1a1a1a", text: "#f5f5f5", label: "Dark" },
];

export function AnnouncementEditor({ restaurantId }: AnnouncementEditorProps) {
  const [data, setData] = useState<AnnouncementData>({
    text: "",
    bgColor: "#f59e0b",
    textColor: "#1a1a1a",
    startTime: "",
    endTime: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (k: keyof AnnouncementData, v: string | boolean) =>
    setData((d) => ({ ...d, [k]: v }));

  const handleSave = async () => {
    if (!data.text.trim()) return;
    setSaving(true);

    try {
      await fetch(`/api/restaurants/${restaurantId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Live Preview */}
      <div
        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all"
        style={{ backgroundColor: data.bgColor, color: data.textColor }}
      >
        <Megaphone className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium truncate">
          {data.text || "Your announcement will appear here…"}
        </span>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Message</Label>
        <Input
          value={data.text}
          onChange={(e) => update("text", e.target.value)}
          placeholder="Garden open today! Happy Hour 5–7pm 🍹"
          maxLength={120}
          className="h-11"
        />
        <p className="text-xs text-zinc-400 text-right">{data.text.length}/120</p>
      </div>

      {/* Color Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Background Color</Label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.bg}
              title={c.label}
              onClick={() => { update("bgColor", c.bg); update("textColor", c.text); }}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                data.bgColor === c.bg ? "border-zinc-900 dark:border-white scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c.bg }}
            />
          ))}
          <input
            type="color"
            value={data.bgColor}
            onChange={(e) => update("bgColor", e.target.value)}
            className="w-8 h-8 rounded-full cursor-pointer border-0"
            title="Custom color"
          />
        </div>
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Show From</Label>
          <Input
            type="datetime-local"
            value={data.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            className="h-10 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Hide At</Label>
          <Input
            type="datetime-local"
            value={data.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Active</p>
          <p className="text-xs text-zinc-500">Show this announcement now</p>
        </div>
        <Switch checked={data.isActive} onCheckedChange={(v) => update("isActive", v)} />
      </div>

      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
        onClick={handleSave}
        disabled={saving || !data.text.trim()}
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save Announcement"}
      </Button>
    </div>
  );
}
