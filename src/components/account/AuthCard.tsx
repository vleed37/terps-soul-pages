import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { Hairline } from "@/components/brand/Hairline";

export function AuthCard({
  label,
  title,
  subtitle,
  children,
}: {
  label: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-[calc(100vh-88px)] py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, var(--accent-gold) 0%, transparent 60%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-[90%] max-w-[480px] rounded-[8px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-elevated)] p-8 md:p-16"
      >
        <div className="flex justify-center">
          <Logo height={64} />
        </div>
        <Hairline className="my-6" />
        <div className="text-center">
          <MetaLabel gold>{label}</MetaLabel>
          <h1 className="mt-4 font-display text-3xl md:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-3 text-sm text-[color:var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        <div className="mt-10">{children}</div>
      </motion.div>
    </section>
  );
}

export const authInputCls =
  "w-full rounded-[4px] border border-[color:var(--border-luxe)] bg-[color:var(--bg-base)] px-4 py-3 text-[color:var(--text-primary)] outline-none transition-colors duration-300 focus:border-[color:var(--accent-gold)]";

export function AuthField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="meta-xs mb-2 block text-[color:var(--text-tertiary)]">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
