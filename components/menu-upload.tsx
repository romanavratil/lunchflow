"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { ParsedMenu } from "@/lib/types";

interface MenuUploadProps {
  onParsed: (menu: ParsedMenu) => void;
}

export function MenuUpload({ onParsed }: MenuUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setError(null);
      setPreview(URL.createObjectURL(file));
      setLoading(true);

      try {
        const fd = new FormData();
        fd.append("image", file);

        const res = await fetch("/api/parse-menu", { method: "POST", body: fd });

        if (!res.ok) {
          const { error: msg } = await res.json();
          throw new Error(msg ?? "Parse failed");
        }

        const data: ParsedMenu = await res.json();
        onParsed(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic"] },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed
          transition-all cursor-pointer min-h-[280px]
          ${isDragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}
          ${loading ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Menu preview"
              className="max-h-48 rounded-xl object-contain shadow-lg"
            />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl">
                <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                <span className="text-white text-sm font-medium">Parsing menu with AI…</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/40 p-4">
              {loading ? (
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              ) : (
                <Upload className="h-8 w-8 text-indigo-600" />
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                {isDragActive ? "Drop your menu here" : "Drop a menu photo here"}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                JPG, PNG, WEBP — chalkboard, printed, or handwritten
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
              <ImageIcon className="h-4 w-4" />
              <span>AI will extract items & prices automatically</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
