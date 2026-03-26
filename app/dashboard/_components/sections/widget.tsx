"use client";

import { WidgetDesigner } from "@/components/widget-designer";
import { Code2, CheckCircle2 } from "lucide-react";

export function WidgetSection({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const snippet = restaurantId
    ? `<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}/widget.js';
    s.dataset.restaurantId = '${restaurantId}';
    document.head.appendChild(s);
  })();
</script>`
    : "";

  const features = [
    "Announcement banner (when active)",
    "Floating button — position & label you set",
    "Menu modal — colors & corners from your design",
    "Shadow DOM — host CSS never bleeds in",
    "Auto-refreshes every 30 seconds",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Designer */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-[14px] font-semibold text-gray-900">Widget Designer</h2>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Customize appearance, schedule, and position
          </p>
        </div>
        <div className="p-5">
          <WidgetDesigner restaurantId={restaurantId} restaurantName={restaurantName} />
        </div>
      </div>

      {/* Embed code */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-0.5">
            <Code2 className="h-4 w-4 text-indigo-500" />
            <h2 className="text-[14px] font-semibold text-gray-900">Embed Code</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Paste once into your site&apos;s &lt;head&gt; — widget settings update live
          </p>
        </div>
        <div className="p-5">
          <div className="relative rounded-xl bg-gray-950 p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-emerald-400 whitespace-pre-wrap text-[12px]">{snippet}</pre>
            <button
              className="absolute top-3 right-3 text-[11px] text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition"
              onClick={() => navigator.clipboard.writeText(snippet)}
            >
              Copy
            </button>
          </div>

          <ul className="mt-5 space-y-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-[13px] text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
