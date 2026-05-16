import { cn } from "@/lib/utils";
export function PullQuote({ children, attribution, className }: { children: React.ReactNode; attribution?: string; className?: string }) {
  return (
    <figure className={cn("text-center", className)}>
      <blockquote className="font-display italic text-[2rem] leading-[1.2] text-[color:var(--text-primary)] md:text-[3rem]">
        {children}
      </blockquote>
      {attribution && <figcaption className="meta-xs mt-6 text-gold">— {attribution}</figcaption>}
    </figure>
  );
}
