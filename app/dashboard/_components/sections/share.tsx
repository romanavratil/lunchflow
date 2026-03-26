"use client";

import { useState } from "react";
import { SocialCardPreview } from "@/components/social-card-preview";
import { MenuEditor } from "@/components/menu-editor";
import { ParsedMenu } from "@/lib/types";
import { ImageIcon, ArrowRight } from "lucide-react";

export function ShareSection({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const [menu, setMenu] = useState<ParsedMenu>({ soup: null, mains: [] });
  const [savedMenuId, setSavedMenuId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: ParsedMenu, publish: boolean) => {
    if (!restaurantId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isPublished: publish }),
      });
      const saved = await res.json();
      setSavedMenuId(saved.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {!savedMenuId ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-[14px] font-semibold text-gray-900">Step 1 — Save your menu</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Enter or import today&apos;s items, then hit Save
              </p>
            </div>
            <div className="p-5">
              <MenuEditor
                menu={menu}
                onChange={setMenu}
                onSave={handleSave}
                saving={saving}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-10 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-gray-600">Social card preview</p>
              <p className="text-[12px] text-gray-400 mt-1 flex items-center gap-1 justify-center">
                Save a menu first <ArrowRight className="h-3 w-3" />
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden w-full max-w-sm">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-0.5">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
                <h2 className="text-[14px] font-semibold text-gray-900">Export for Social</h2>
              </div>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Story (9:16) or Post (1:1) — ready to download
              </p>
            </div>
            <div className="p-5">
              <SocialCardPreview
                menuId={savedMenuId}
                restaurantName={restaurantName}
                brandingColor="#6366f1"
                soup={menu.soup}
                mains={menu.mains}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
