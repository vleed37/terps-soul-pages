import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminGrantAdmin,
  adminListAdmins,
  adminRevokeAdmin,
} from "@/lib/admin-ops.functions";
import { Field, Panel, TableShell, Td, Th, dateZa } from "@/components/admin/AdminUI";
import { GoldButton } from "@/components/brand/GoldButton";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const list = useServerFn(adminListAdmins);
  const grant = useServerFn(adminGrantAdmin);
  const revoke = useServerFn(adminRevokeAdmin);
  const [email, setEmail] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["admin-admins"], queryFn: () => list() });

  const grantMut = useMutation({
    mutationFn: () => grant({ data: { email: email.trim() } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Access granted.");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin-admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMut = useMutation({
    mutationFn: (user_id: string) => revoke({ data: { user_id } }),
    onSuccess: (res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Access removed.");
      qc.invalidateQueries({ queryKey: ["admin-admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <Panel
        title="Who can manage Terps"
        description="Access is stored in the database, not in the browser. The person must already have a Terps account."
      >
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <Field label="Account email">
            <Input
              className="w-72"
              value={email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <GoldButton disabled={grantMut.isPending || !email.includes("@")} onClick={() => grantMut.mutate()}>
            {grantMut.isPending ? "Granting…" : "Grant access"}
          </GoldButton>
        </div>

        {isLoading ? (
          <p className="text-sm text-[color:var(--text-tertiary)]">Loading…</p>
        ) : (
          <TableShell>
            <thead className="bg-[color:var(--bg-elevated)]">
              <tr>
                <Th>Email</Th>
                <Th>Granted</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-subtle)]">
              {(data ?? []).map((a) => (
                <tr key={a.id}>
                  <Td>{a.email ?? a.user_id}</Td>
                  <Td>{dateZa(a.created_at)}</Td>
                  <Td>
                    <button className="ghost-link text-xs" onClick={() => revokeMut.mutate(a.user_id)}>
                      Remove
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Panel>

      <Panel title="Things handled outside this screen">
        <ul className="space-y-2 text-sm text-[color:var(--text-secondary)]">
          <li>· Payment status is set only by the payment provider, never by hand.</li>
          <li>· Legal pages remain drafts until your legal wording is supplied.</li>
          <li>· Delivery pricing stays hidden on the shop until confirmed rates are provided.</li>
          <li>· Address-to-map conversion needs a mapping credential before pins appear automatically.</li>
        </ul>
      </Panel>
    </div>
  );
}
