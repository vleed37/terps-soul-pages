import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  adminGetStrain,
  adminUpdateStrain,
  generateStrainInfo,
} from "@/lib/admin.functions";
import { GoldButton } from "@/components/brand/GoldButton";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/strains/$id/edit")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/account/login", search: { redirect: location.pathname } });
    }
    const role =
      (data.user.user_metadata as { role?: string } | null)?.role ??
      (data.user.app_metadata as { role?: string } | null)?.role;
    if (role !== "admin") {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Admin · Edit strain" }, { name: "robots", content: "noindex" }] }),
  component: EditStrain,
});

type Form = {
  name: string;
  story: string;
  lineage: string;
  flavor_tags: string[];
  effects: string[];
  helps_with: string[];
  negatives: string[];
  terpene_breakdown: Array<{ name: string; percentage: number; descriptor: string }>;
};

function arrToCsv(a: string[] | null | undefined) {
  return (a ?? []).join(", ");
}
function csvToArr(v: string) {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function EditStrain() {
  const { id } = Route.useParams();
  const getFn = useServerFn(adminGetStrain);
  const saveFn = useServerFn(adminUpdateStrain);
  const aiFn = useServerFn(generateStrainInfo);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiName, setAiName] = useState("");
  const [form, setForm] = useState<Form>({
    name: "",
    story: "",
    lineage: "",
    flavor_tags: [],
    effects: [],
    helps_with: [],
    negatives: [],
    terpene_breakdown: [],
  });

  useEffect(() => {
    let cancelled = false;
    getFn({ data: { id } })
      .then((s: any) => {
        if (cancelled || !s) return;
        setForm({
          name: s.name ?? "",
          story: s.story ?? "",
          lineage: s.lineage ?? "",
          flavor_tags: s.flavor_tags ?? [],
          effects: s.effects ?? [],
          helps_with: s.helps_with ?? [],
          negatives: s.negatives ?? [],
          terpene_breakdown: s.terpene_breakdown ?? [],
        });
        setAiName(s.name ?? "");
      })
      .catch((e) => toast.error(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, getFn]);

  const handleAI = async () => {
    if (!aiName.trim()) return toast.error("Enter a strain name first.");
    setAiLoading(true);
    try {
      const data: any = await aiFn({ data: { strainName: aiName.trim() } });
      if (data?.strain_unknown) {
        toast.error("Strain not found in public databases. Enter manually.");
        return;
      }
      setForm((f) => ({
        ...f,
        effects: data.effects ?? f.effects,
        flavor_tags: data.flavors ?? f.flavor_tags,
        helps_with: data.helps_with ?? f.helps_with,
        negatives: data.negatives ?? f.negatives,
        lineage: data.lineage ?? f.lineage,
        story: data.story ?? f.story,
        terpene_breakdown: data.terpenes ?? f.terpene_breakdown,
      }));
      toast.success("Content generated. Review and edit before saving.");
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFn({ data: { id, ...form } });
      toast.success("Saved.");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[color:var(--text-secondary)]" />
      </section>
    );
  }

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="meta-xs mb-2 block text-[color:var(--text-tertiary)]">{children}</label>
  );

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <Link to="/" className="ghost-link">← Home</Link>
      <h1 className="mt-6 font-display text-4xl md:text-5xl">Edit strain</h1>

      {/* AI Assist */}
      <div
        className="mt-10 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-7"
        style={{ borderLeft: "3px solid var(--accent-sage, #7d9b76)" }}
      >
        <MetaLabel className="text-[color:var(--accent-sage,#7d9b76)]">✦ AI ASSIST</MetaLabel>
        <h2 className="mt-3 font-display text-2xl">Auto-fill from strain name</h2>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
          Type the strain name. We'll fetch effects, flavors, terpenes, lineage, and a story
          draft from public cannabis databases. Review and edit before saving.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Input
            value={aiName}
            onChange={(e) => setAiName(e.target.value)}
            placeholder="Strain name"
            className="h-11"
          />
          <GoldButton onClick={handleAI} disabled={aiLoading} className="sm:w-auto">
            {aiLoading ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-4 w-4" /> Generate
              </>
            )}
          </GoldButton>
        </div>
      </div>

      {/* Form */}
      <div
        className={`mt-10 space-y-6 transition-opacity ${aiLoading ? "animate-pulse opacity-60" : ""}`}
      >
        <div>
          <FieldLabel>Name</FieldLabel>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <FieldLabel>Story</FieldLabel>
          <textarea
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            rows={5}
            className="w-full rounded-md border border-[color:var(--border-subtle)] bg-transparent p-3 text-sm"
          />
        </div>

        <div>
          <FieldLabel>Lineage</FieldLabel>
          <textarea
            value={form.lineage}
            onChange={(e) => setForm({ ...form, lineage: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-[color:var(--border-subtle)] bg-transparent p-3 text-sm"
          />
        </div>

        {(["effects", "flavor_tags", "helps_with", "negatives"] as const).map((key) => (
          <div key={key}>
            <FieldLabel>{key.replace("_", " ").toUpperCase()} (comma separated)</FieldLabel>
            <Input
              value={arrToCsv(form[key])}
              onChange={(e) => setForm({ ...form, [key]: csvToArr(e.target.value) })}
            />
          </div>
        ))}

        <div>
          <FieldLabel>Terpene breakdown</FieldLabel>
          <div className="space-y-2">
            {form.terpene_breakdown.map((t, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-4"
                  value={t.name}
                  onChange={(e) => {
                    const arr = [...form.terpene_breakdown];
                    arr[i] = { ...arr[i], name: e.target.value };
                    setForm({ ...form, terpene_breakdown: arr });
                  }}
                />
                <Input
                  className="col-span-2"
                  type="number"
                  step="0.01"
                  value={t.percentage}
                  onChange={(e) => {
                    const arr = [...form.terpene_breakdown];
                    arr[i] = { ...arr[i], percentage: Number(e.target.value) };
                    setForm({ ...form, terpene_breakdown: arr });
                  }}
                />
                <Input
                  className="col-span-6"
                  value={t.descriptor}
                  onChange={(e) => {
                    const arr = [...form.terpene_breakdown];
                    arr[i] = { ...arr[i], descriptor: e.target.value };
                    setForm({ ...form, terpene_breakdown: arr });
                  }}
                />
              </div>
            ))}
            <button
              type="button"
              className="ghost-link text-xs"
              onClick={() =>
                setForm({
                  ...form,
                  terpene_breakdown: [
                    ...form.terpene_breakdown,
                    { name: "", percentage: 0, descriptor: "" },
                  ],
                })
              }
            >
              + Add terpene
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <GoldButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </GoldButton>
      </div>
    </section>
  );
}