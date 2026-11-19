import Image from "next/image";

/**
 * The cover image on a game's card, on /games and on the home page.
 * Files live in public/games/thumbs/<slug>.webp (16:9, 1280×720).
 */
export function GameThumbnail({ slug, sizes, priority }: { slug: string; sizes: string; priority?: boolean }) {
  return (
    <Image
      src={`/games/thumbs/${slug}.webp`}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
    />
  );
}
