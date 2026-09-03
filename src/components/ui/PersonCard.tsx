import Image from "next/image";

/**
 * PersonCard — team member tile. Shows the approved supplied portrait when
 * available and falls back to initials without inventing an identity image.
 */
export function PersonCard({
  name,
  role,
  bio,
  image,
}: {
  name: string;
  role: string;
  bio?: string;
  image?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <article className="person-editorial h-full overflow-hidden border-t border-deep-blue/20 bg-surface pt-5 transition-colors duration-300 hover:border-brand-red/55">
      {image ? (
        <div className="person-editorial__portrait relative mb-6 aspect-square w-32 overflow-hidden rounded-full bg-white">
          <Image
            src={image}
            alt=""
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-serif text-xl text-accent"
        >
          {initials}
        </div>
      )}
      <h3 className="text-xl">{name}</h3>
      <p className="mt-2 text-sm font-semibold text-verdigris">{role}</p>
      {bio && <p className="mt-3 leading-relaxed text-muted">{bio}</p>}
    </article>
  );
}
