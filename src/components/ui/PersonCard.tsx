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
    <article className="person-editorial group h-full overflow-hidden rounded-[1.75rem] border border-deep-blue/12 bg-white/82 shadow-[0_24px_70px_-42px_rgba(4,43,68,0.72)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-brand-red/35">
      {image ? (
        <div className="person-editorial__portrait relative aspect-[4/3] w-full overflow-hidden bg-white">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover object-top transition duration-500 group-hover:scale-[1.025]"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="m-6 mb-0 flex h-20 w-20 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-serif text-xl text-accent"
        >
          {initials}
        </div>
      )}
      <div className="p-6 sm:p-7">
        <h3 className="text-xl">{name}</h3>
        <p className="mt-2 text-sm font-semibold text-verdigris">{role}</p>
        {bio && <p className="mt-4 leading-relaxed text-muted">{bio}</p>}
      </div>
    </article>
  );
}
