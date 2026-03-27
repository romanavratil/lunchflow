"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { MenuItem, ParsedMenu } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface MenuEditorProps {
  menu: ParsedMenu;
  onChange: (menu: ParsedMenu) => void;
  onSave: (menu: ParsedMenu, publish: boolean) => Promise<void>;
  saving?: boolean;
  currency?: string;
}

export function MenuEditor({ menu, onChange, onSave, saving, currency }: MenuEditorProps) {
  const [publishing, setPublishing] = useState(false);

  const updateSoup = (v: string) => onChange({ ...menu, soup: v || null });
  const updateSoupPrice = (v: string) => onChange({ ...menu, soupPrice: v || null });

  const updateMain = (i: number, field: keyof MenuItem, value: string | boolean) => {
    const mains = menu.mains.map((m, idx) => (idx === i ? { ...m, [field]: value } : m));
    onChange({ ...menu, mains });
  };

  const addMain = () =>
    onChange({ ...menu, mains: [...menu.mains, { name: "", description: "", price: "", soldOut: false }] });

  const removeMain = (i: number) =>
    onChange({ ...menu, mains: menu.mains.filter((_, idx) => idx !== i) });

  const handleSave = async (publish: boolean) => {
    setPublishing(publish);
    await onSave(menu, publish);
    setPublishing(false);
  };

  return (
    <div className="space-y-6">
      {/* Soup */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Soup of the Day
          <span className="ml-2 font-normal text-zinc-400">(optional)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={menu.soup ?? ""}
            onChange={(e) => updateSoup(e.target.value)}
            placeholder="e.g. Roasted Tomato Bisque"
            className="h-11 flex-1"
          />
          <div className="flex items-center gap-1.5">
            <Input
              value={menu.soupPrice ?? ""}
              onChange={(e) => updateSoupPrice(e.target.value)}
              placeholder="0"
              className="h-11 w-20"
            />
            {currency && (
              <span className="text-[13px] font-semibold text-zinc-400 whitespace-nowrap">{currency}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mains */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Main Courses
          </Label>
          <Badge variant="secondary">{menu.mains.length} items</Badge>
        </div>

        <div className="space-y-2">
          {menu.mains.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                item.soldOut
                  ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <Input
                  value={item.name}
                  onChange={(e) => updateMain(i, "name", e.target.value)}
                  placeholder="Dish name"
                  className={`h-9 mb-1.5 ${item.soldOut ? "line-through opacity-50" : ""}`}
                />
                <Input
                  value={item.description ?? ""}
                  onChange={(e) => updateMain(i, "description", e.target.value)}
                  placeholder="Description (optional)"
                  className="h-8 mb-1.5 text-[12px] text-gray-500"
                />
                <div className="flex items-center gap-1.5">
                  <Input
                    value={item.price}
                    onChange={(e) => updateMain(i, "price", e.target.value)}
                    placeholder="0"
                    className="h-9 w-24"
                  />
                  {currency && (
                    <span className="text-[12px] font-semibold text-zinc-400 whitespace-nowrap">{currency}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  {item.soldOut && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                  <span className="text-xs text-zinc-500">Sold out</span>
                </div>
                <Switch
                  checked={item.soldOut ?? false}
                  onCheckedChange={(v) => updateMain(i, "soldOut", v)}
                />
              </div>

              <button
                onClick={() => removeMain(i)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addMain}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleSave(false)}
          disabled={saving || publishing}
        >
          {saving && !publishing ? "Saving…" : "Save Draft"}
        </Button>
        <Button
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={() => handleSave(true)}
          disabled={saving || publishing}
        >
          {publishing ? "Publishing…" : "Publish Menu"}
        </Button>
      </div>
    </div>
  );
}
