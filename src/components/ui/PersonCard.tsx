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
  bio?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="glass-panel h-full rounded-3xl p-7 transition-transform duration-300 motion-safe:hover:-translate-y-1">
      <div
        aria-hidden="true"
        className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-serif text-xl text-accent"
      >
        {initials}
      </div>
      <h3 className="text-xl">{name}</h3>
      <p className="mt-2 text-sm font-semibold text-verdigris">{role}</p>
      {bio && <p className="mt-3 leading-relaxed text-muted">{bio}</p>}
    </div>
  );
}
