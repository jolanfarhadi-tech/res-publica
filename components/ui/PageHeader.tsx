export function PageHeader({
  heading,
  description,
}: {
  heading: string;
  description?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {heading}
      </h1>
      {description && (
        <p className="mt-3 text-lg leading-8 text-muted">{description}</p>
      )}
    </div>
  );
}
