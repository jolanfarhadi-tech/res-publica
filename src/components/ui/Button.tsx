import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 " +
  "text-sm font-medium transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-contrast hover:opacity-90",
  secondary:
    "border border-border bg-surface text-ink hover:border-accent hover:text-accent",
  ghost: "text-accent hover:underline underline-offset-4",
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
