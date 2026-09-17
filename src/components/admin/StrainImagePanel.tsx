import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminRemoveStrainImage, adminUploadStrainImage } from "@/lib/admin-ops.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { Panel } from "@/components/admin/AdminUI";

/** Product photo manager. Files are validated and stored server-side. */
export function StrainImagePanel({ id, initialUrl }: { id: string; initialUrl: string | null }) {
  const upload = useServerFn(adminUploadStrainImage);
  const remove = useServerFn(adminRemoveStrainImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 6 * 1024 * 1024) throw new Error("Please choose an image of 6 MB or smaller.");
      const buf = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      return upload({
        data: { id, contentType: file.type, dataBase64: btoa(binary) },
      });
    },
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setUrl(res.url);
      toast.success("Photo updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: () => remove({ data: { id } }),
    onSuccess: () => {
      setUrl(null);
      toast.success("Photo removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Panel title="Product photo" description="JPG, PNG, WebP or AVIF up to 6 MB.">
      <div className="flex flex-wrap items-center gap-6">
        <div className="h-32 w-32 overflow-hidden rounded-[8px] border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)]">
          {url ? (
            <img src={url} alt="Current product photo" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[color:var(--text-tertiary)]">
              No photo
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadMut.mutate(file);
              e.target.value = "";
            }}
          />
          <GoldButton disabled={uploadMut.isPending} onClick={() => inputRef.current?.click()}>
            {uploadMut.isPending ? "Uploading…" : url ? "Replace photo" : "Upload photo"}
          </GoldButton>
          {url && (
            <GoldButton variant="secondary" disabled={removeMut.isPending} onClick={() => removeMut.mutate()}>
              Remove
            </GoldButton>
          )}
        </div>
      </div>
    </Panel>
  );
}
