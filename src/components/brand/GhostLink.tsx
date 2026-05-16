import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Props = { to?: string; href?: string; children: React.ReactNode; className?: string; onClick?: () => void };
export function GhostLink({ to, href, children, className, onClick }: Props) {
  const content = (
    <>
      <span>{children}</span>
      <span aria-hidden>→</span>
    </>
  );
  if (to) {
    return <Link to={to} className={cn("ghost-link", className)} onClick={onClick}>{content}</Link>;
  }
  if (href) {
    return <a href={href} className={cn("ghost-link", className)} onClick={onClick}>{content}</a>;
  }
  return <button type="button" onClick={onClick} className={cn("ghost-link", className)}>{content}</button>;
}
