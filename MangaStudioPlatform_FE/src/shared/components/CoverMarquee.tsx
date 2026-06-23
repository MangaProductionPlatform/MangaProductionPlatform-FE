import { mangaCoverImages } from "../visuals/mangaVisuals";

type CoverMarqueeProps = {
  compact?: boolean;
};

export default function CoverMarquee({ compact = false }: CoverMarqueeProps) {
  const covers = [...mangaCoverImages, ...mangaCoverImages];

  return (
    <div className="cover-marquee overflow-hidden">
      <div className="cover-marquee-track flex w-max gap-4">
        {covers.map((cover, index) => (
          <article
            key={`${cover.title}-${index}`}
            className={`group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br ${cover.tone} shadow-[0_18px_45px_rgba(2,6,23,0.35)] ${
              compact ? "h-44 w-28" : "h-64 w-40"
            }`}
          >
            <div
              aria-label={`${cover.title} manga cover inspiration`}
              className="absolute inset-0 bg-cover bg-no-repeat opacity-95 transition duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `url(${cover.image})`,
                backgroundPosition: cover.position,
                backgroundSize: "cover",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0),rgba(2,6,23,0.82))]" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/75">
                {cover.genre}
              </p>
              <h3 className="mt-1 text-sm font-black leading-tight text-white">
                {cover.title}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
