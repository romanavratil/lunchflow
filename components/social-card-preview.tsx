"use client";

import { useState } from "react";
import { Download, Share2, Smartphone, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/lib/types";

interface SocialCardPreviewProps {
  menuId: string;
  restaurantName: string;
  brandingColor: string;
  soup: string | null;
  mains: MenuItem[];
}

type Format = "story" | "post";

export function SocialCardPreview({
  menuId,
  restaurantName,
  brandingColor,
  soup,
  mains,
}: SocialCardPreviewProps) {
  const [format, setFormat] = useState<Format>("story");
  const [downloading, setDownloading] = useState(false);

  const shareUrl = `/api/share/${menuId}?format=${format}`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(shareUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-${format}-${menuId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Format Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setFormat("story")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            format === "story"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400"
          }`}
        >
          <Smartphone className="h-4 w-4" />
          Story (9:16)
        </button>
        <button
          onClick={() => setFormat("post")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            format === "post"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400"
          }`}
        >
          <Square className="h-4 w-4" />
          Post (1:1)
        </button>
      </div>

      {/* Card Preview */}
      <div
        className={`relative mx-auto overflow-hidden rounded-2xl shadow-2xl ${
          format === "story" ? "w-48 h-[342px]" : "w-64 h-64"
        }`}
        style={{ background: `linear-gradient(145deg, ${brandingColor} 0%, #0f0f1a 100%)` }}
      >
        {/* Decorative circle */}
        <div
          className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-10"
          style={{ background: "white" }}
        />

        <div className="relative z-10 flex flex-col h-full p-4 text-white">
          {/* Header */}
          <div className="mb-3">
            <p className="text-[8px] uppercase tracking-widest text-white/40">{date}</p>
            <p
              className="font-bold leading-tight mt-0.5"
              style={{ fontSize: format === "story" ? "14px" : "12px" }}
            >
              {restaurantName}
            </p>
            <p className="text-[9px] text-white/50 font-light">Today&apos;s Menu</p>
          </div>

          <div className="h-px bg-white/20 mb-3" />

          {soup && (
            <div className="mb-3">
              <p className="text-[7px] uppercase tracking-wider text-white/40 mb-1">Soup</p>
              <p className="text-[10px] italic font-medium">{soup}</p>
            </div>
          )}

          <div className="space-y-1.5 flex-1 overflow-hidden">
            <p className="text-[7px] uppercase tracking-wider text-white/40 mb-1">Mains</p>
            {mains.slice(0, 4).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-2 py-1 text-[9px]"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <span className={item.soldOut ? "line-through opacity-40" : ""}>{item.name}</span>
                <span className="font-semibold text-white/80">{item.price}</span>
              </div>
            ))}
            {mains.length > 4 && (
              <p className="text-[8px] text-white/30 text-center pt-1">
                +{mains.length - 4} more
              </p>
            )}
          </div>

          <div className="mt-auto pt-2 border-t border-white/10">
            <p className="text-[7px] text-white/20">Powered by LunchFlow</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Badge variant="secondary" className="text-xs">
          1080×{format === "story" ? "1920" : "1080"} PNG
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(shareUrl, "_blank")}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "Generating…" : "Download"}
        </Button>
      </div>
    </div>
  );
}
