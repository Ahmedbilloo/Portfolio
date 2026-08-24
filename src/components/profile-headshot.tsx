interface ProfileHeadshotProps {
  name: string;
}

const defaultHeadshot = "/headshot.png";

export function ProfileHeadshot({ name }: ProfileHeadshotProps) {
  return (
    <div className="relative group">
      <div
        id="profile-headshot-container"
        className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <img
          src={defaultHeadshot}
          alt={name}
          className="size-full object-cover object-[center_12%] transition-transform duration-300 group-hover:scale-[1.02]"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}
