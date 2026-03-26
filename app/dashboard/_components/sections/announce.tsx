"use client";

import { AnnouncementEditor } from "@/components/announcement-editor";
import { Megaphone } from "lucide-react";

export function AnnounceSection({ restaurantId }: { restaurantId: string }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-0.5">
            <Megaphone className="h-4 w-4 text-indigo-500" />
            <h2 className="text-[14px] font-semibold text-gray-900">Announcement Bar</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Displays at the top of your site and inside the widget
          </p>
        </div>
        <div className="p-5">
          <AnnouncementEditor restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
}
