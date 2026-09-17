import { AlertTriangle } from "lucide-react";

import { PENDING_BUSINESS_DETAILS, SHOW_LEGAL_DRAFT_NOTICE } from "@/lib/business";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { legalReadiness } from "@/lib/settings";

/**
 * Draft banner. It disappears only when every required business/legal field has
 * been supplied AND legal approval has been recorded in Settings — a single flag
 * is never enough. Falls back to the compile-time flag while settings load.
 */
export function LegalDraftNotice() {
  const settings = useSiteSettings();
  const legal = legalReadiness(settings);
  const outstanding = legal.missing.length > 0 ? legal.missing : PENDING_BUSINESS_DETAILS;

  if (legal.ready && !SHOW_LEGAL_DRAFT_NOTICE) return null;
  if (legal.ready) return null;


  return (
    <aside
      role="note"
      aria-label="Draft policy notice"
      className="mt-10 rounded-[6px] border border-[color:var(--accent-gold)] bg-[color:var(--accent-gold-muted)] p-6"
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-gold)]">
        <AlertTriangle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        Draft — legal and business details pending
      </p>
      <p className="mt-3 font-body text-sm leading-[1.75] text-[color:var(--text-secondary)]">
        This policy is a working draft. It has not been reviewed or approved by a
        legal practitioner, and the details below are still outstanding from the
        business owner. Publication is blocked until both are resolved.
      </p>
      {outstanding.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-1 text-sm text-[color:var(--text-tertiary)] sm:grid-cols-2">
          {outstanding.map((d) => (
            <li key={d}>· {d}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}

/**
 * Renders a business value that has not been confirmed yet. Ordinary visitors
 * see plain prose — never a raw `[PLACEHOLDER]`.
 */
export function Pending({ label }: { label: string }) {
  return (
    <em className="not-italic text-[color:var(--text-tertiary)]">
      ({label} to be confirmed)
    </em>
  );
}
