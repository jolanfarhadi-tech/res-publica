/**
 * PersonCard — team member tile. Shows initials until a
 * real photo is provided in the team data.
 */
export function PersonCard({
  name,
  role,
  bio,
}: {
  name: string;
  role: string;
  bio: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="rounded-2xl border border-border bg-surface p-7">
      <div
        aria-hidden="true"
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent font-serif text-lg text-accent-contrast"
      >
        {initials}
      </div>
      <h3 className="text-xl">{name}</h3>
      <p className="mt-1 text-sm font-medium text-gold">{role}</p>
      <p className="mt-3 leading-relaxed text-muted">{bio}</p>
    </div>
  );
}
