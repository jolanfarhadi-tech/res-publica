import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 " +
  "text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow,opacity] duration-200 " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const variants: Record<Variant, string> = {
  primary:
    "border border-accent bg-accent text-accent-contrast shadow-[0_12px_28px_-20px_var(--accent)] hover:-translate-y-0.5 hover:bg-ink",
  secondary:
    "border border-border bg-surface text-ink hover:border-accent hover:text-accent",
  ghost: "text-accent hover:bg-accent/8",
};

/**
 * Button — pass `href` to render a link, omit it for a real button.
 * The two elements share identical styling so the UI stays coherent.
 */
export function Button({
  href,
  variant = "primary",
  children,
  ...rest
}: {
  href?: string;
  variant?: Variant;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const className = `${base} ${variants[variant]}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button className={className} {...rest}>
      {children}
    </button>
  );
}
