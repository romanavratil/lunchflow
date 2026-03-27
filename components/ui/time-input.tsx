"use client";

/** 24-hour time picker — two selects (HH : MM).
 *  value / onChange use "HH:MM" strings (e.g. "14:30"). */
export function TimeInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [hh, mm] = (value || "00:00").split(":");

  const hours   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const sel =
    "h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 " +
    "px-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none " +
    "focus:ring-2 focus:ring-indigo-500 cursor-pointer " + (className || "");

  return (
    <div className="flex items-center gap-1">
      <select
        value={hh}
        onChange={(e) => onChange(`${e.target.value}:${mm}`)}
        className={sel}
        style={{ width: 64 }}
      >
        {hours.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-sm font-bold text-zinc-400 select-none">:</span>
      <select
        value={mm}
        onChange={(e) => onChange(`${hh}:${e.target.value}`)}
        className={sel}
        style={{ width: 64 }}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}

/** 24-hour date+time picker.
 *  value / onChange use "YYYY-MM-DDTHH:MM" strings. */
export function DateTimeInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const sep      = value ? value.indexOf("T") : -1;
  const datePart = sep !== -1 ? value.slice(0, sep) : value || "";
  const timePart = sep !== -1 ? value.slice(sep + 1, sep + 6) : "00:00";

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className || ""}`}>
      <input
        type="date"
        value={datePart}
        onChange={(e) => onChange(`${e.target.value}T${timePart}`)}
        className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900
          px-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none
          focus:ring-2 focus:ring-indigo-500"
      />
      <TimeInput
        value={timePart}
        onChange={(t) => onChange(`${datePart}T${t}`)}
      />
    </div>
  );
}
