// Shared skeleton building blocks
function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200/80 ${className ?? ""}`} style={style} />
  );
}

/** Just the inner form fields — used when the card wrapper already exists */
export function AnnouncementFormSkeleton() {
  return (
    <div className="space-y-5">
      <Bone className="h-12 w-full rounded-xl" />
      <div className="space-y-2">
        <Bone className="h-3.5 w-16" />
        <Bone className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Bone className="h-3.5 w-28" />
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bone key={i} className="w-8 h-8 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <Bone className="h-3.5 w-20" />
          <div className="flex gap-2">
            <Bone className="h-10 w-24" />
            <Bone className="h-10 w-16" />
            <Bone className="h-10 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <Bone className="h-3.5 w-16" />
          <div className="flex gap-2">
            <Bone className="h-10 w-24" />
            <Bone className="h-10 w-16" />
            <Bone className="h-10 w-16" />
          </div>
        </div>
      </div>
      <Bone className="h-14 w-full rounded-xl" />
      <Bone className="h-11 w-full" />
    </div>
  );
}

// ── Page skeletons ─────────────────────────────────────────────────────────────

export function MenuSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Week strip */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bone key={i} className="h-12 flex-1" />
          ))}
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Editor card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
          <Bone className="h-5 w-1/3" />
          <Bone className="h-11 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl border border-gray-100">
                <div className="flex-1 space-y-2">
                  <Bone className="h-9" />
                  <Bone className="h-8" />
                  <Bone className="h-9 w-24" />
                </div>
                <Bone className="h-16 w-10 shrink-0" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Bone className="h-11 flex-1" />
            <Bone className="h-11 flex-1" />
          </div>
        </div>

        {/* AI import card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
          <Bone className="h-5 w-1/2" />
          <Bone className="h-40 w-full rounded-xl" />
          <Bone className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

export function AnnouncementSkeleton() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 space-y-1.5">
          <Bone className="h-4 w-40" />
          <Bone className="h-3 w-56" />
        </div>
        <div className="p-5 space-y-5">
          {/* Preview bar */}
          <Bone className="h-12 w-full rounded-xl" />
          {/* Message */}
          <div className="space-y-2">
            <Bone className="h-3.5 w-16" />
            <Bone className="h-11 w-full" />
          </div>
          {/* Color row */}
          <div className="space-y-2">
            <Bone className="h-3.5 w-28" />
            <div className="flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <Bone key={i} className="w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>
          {/* Date/time inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Bone className="h-3.5 w-20" />
              <Bone className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Bone className="h-3.5 w-16" />
              <Bone className="h-10 w-full" />
            </div>
          </div>
          {/* Toggle */}
          <Bone className="h-14 w-full rounded-xl" />
          {/* Button */}
          <Bone className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ShareSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Day picker */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bone key={i} className="h-12 flex-1" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Social card preview */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
          <Bone className="h-5 w-32" />
          <Bone className="h-64 w-full rounded-xl" />
          <div className="flex gap-3">
            <Bone className="h-10 flex-1" />
            <Bone className="h-10 flex-1" />
          </div>
        </div>

        {/* QR card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
          <Bone className="h-5 w-24" />
          <div className="flex justify-center">
            <Bone className="h-48 w-48 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <Bone className="h-10 flex-1" />
            <Bone className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 space-y-1.5">
          <Bone className="h-4 w-36" />
          <Bone className="h-3 w-52" />
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
            {/* Controls */}
            <div className="space-y-6">
              <Bone className="h-14 w-full rounded-xl" />
              <div className="grid grid-cols-3 gap-3">
                <Bone className="h-16 rounded-xl" />
                <Bone className="h-16 rounded-xl" />
                <Bone className="h-16 rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Bone className="h-3 w-16" />
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Bone key={j} className="w-6 h-6 rounded-full" />
                      ))}
                    </div>
                    <Bone className="h-8 w-full" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Bone className="h-3 w-20" />
                  <Bone className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Bone className="h-3 w-16" />
                  <div className="flex gap-2">
                    <Bone className="h-10 flex-1" />
                    <Bone className="h-10 flex-1" />
                  </div>
                </div>
              </div>
              <Bone className="h-11 w-full" />
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <Bone className="h-3 w-20" />
              <Bone className="h-44 w-full rounded-2xl" />
              <Bone className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-3">
            <Bone className="h-4 w-24" />
            <Bone className="h-9 w-16" />
            <Bone className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Bar chart card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 space-y-4">
        <Bone className="h-4 w-32" />
        <div className="flex items-end gap-1.5 h-40 pt-4">
          {[65, 40, 80, 55, 70, 30, 90, 45, 60, 75, 35, 85, 50, 70].map((h, i) => (
            <Bone
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bone key={i} className="h-2.5 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 space-y-1.5">
          <Bone className="h-4 w-28" />
          <Bone className="h-3 w-44" />
        </div>
        <div className="p-5 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-11 w-full" />
            </div>
          ))}
          <div className="space-y-2">
            <Bone className="h-3.5 w-20" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <Bone key={i} className="h-8 w-12 rounded-lg" />
              ))}
            </div>
          </div>
          <Bone className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
