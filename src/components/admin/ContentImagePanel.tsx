import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminClearContentImage, adminUploadContentImage } from "@/lib/settings-admin.functions";
import { IMAGE_SLOTS } from "@/lib/settings";
import { Panel } from "@/components/admin/AdminUI";

async function toBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Maintainable image slots for final client photography. */
export function ContentImagePanel({ settings }: { settings: Record<string, string> }) {
  const qc = useQueryClient();
  const upload = useServerFn(adminUploadContentImage);
  const clear = useServerFn(adminClearContentImage);
  const [busy, setBusy] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    qc.invalidateQueries({ queryKey: ["admin-readiness"] });
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  };

  const clearMut = useMutation({
    mutationFn: (slot: string) => clear({ data: { slot } }),
    onSuccess: () => {
      toast.success("Image removed — the built-in fallback is used again.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function pick(slot: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Images must be 8 MB or smaller.");
      return;
    }
    setBusy(slot);
    try {
      const res = await upload({
        data: { slot, contentType: file.type, dataBase64: await toBase64(file) },
      });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Image saved.");
        refresh();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel
      title="Site imagery"
      description="Upload final photography here — no code change needed. Empty slots keep the current fallback image."
    >
      <ul className="space-y-4">
        {IMAGE_SLOTS.map((slot) => {
          const url = settings[slot.key];
          return (
            <li
              key={slot.key}
              className="flex flex-wrap items-center gap-4 border-b border-[color:var(--border-subtle)] pb-4 last:border-0 last:pb-0"
            >
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)]">
                {url ? (
                  <img src={url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.12em] text-[color:var(--text-tertiary)]">
                    Fallback
                  </span>
                )}
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="font-display text-base">{slot.label}</p>
                <p className="mt-1 text-xs text-[color:var(--text-tertiary)]">{slot.note}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={(el) => {
                    inputs.current[slot.key] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => void pick(slot.key, e.target.files?.[0])}
                />
                <button
                  type="button"
                  className="ghost-link text-xs"
                  disabled={busy === slot.key}
                  onClick={() => inputs.current[slot.key]?.click()}
                >
                  {busy === slot.key ? "Uploading…" : url ? "Replace" : "Upload"}
                </button>
                {url && (
                  <button
                    type="button"
                    className="ghost-link text-xs"
                    onClick={() => clearMut.mutate(slot.key)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
