export function makeMangaArt(
  title: string,
  accentA: string,
  accentB: string,
  accentC: string,
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050816" />
          <stop offset="52%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accentA}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${accentB}" stop-opacity="0.9" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="${accentB}" stop-opacity="0.15" />
          <stop offset="100%" stop-color="${accentC}" stop-opacity="0.95" />
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="28" /></filter>
      </defs>
      <rect width="1200" height="1600" fill="url(#bg)" />
      <circle cx="260" cy="220" r="180" fill="${accentA}" fill-opacity="0.22" filter="url(#blur)" />
      <circle cx="940" cy="240" r="220" fill="${accentC}" fill-opacity="0.18" filter="url(#blur)" />
      <circle cx="940" cy="1220" r="260" fill="${accentB}" fill-opacity="0.18" filter="url(#blur)" />
      <path d="M0 1180 C210 1020, 310 1020, 520 1140 C710 1250, 860 1260, 1200 1090 L1200 1600 L0 1600 Z" fill="url(#g2)" opacity="0.9" />
      <path d="M0 1260 C180 1100, 410 1100, 620 1210 C840 1320, 1010 1310, 1200 1200 L1200 1600 L0 1600 Z" fill="#020617" opacity="0.85" />
      <path d="M180 1100 L250 760 L390 700 L450 1030 Z" fill="url(#g1)" opacity="0.72" />
      <path d="M420 1040 L520 560 L700 520 L760 980 Z" fill="#0ea5e9" opacity="0.22" />
      <path d="M720 980 L810 620 L980 580 L1040 1080 Z" fill="url(#g1)" opacity="0.42" />
      <rect x="170" y="1010" width="860" height="24" rx="12" fill="#e2e8f0" opacity="0.1" />
      <rect x="240" y="930" width="720" height="18" rx="9" fill="#e2e8f0" opacity="0.08" />
      <rect x="360" y="500" width="360" height="520" rx="38" fill="#020617" opacity="0.45" />
      <rect x="405" y="545" width="270" height="420" rx="24" fill="#0f172a" opacity="0.9" />
      <path d="M470 610 L630 620 L590 760 L450 735 Z" fill="#f8fafc" opacity="0.08" />
      <path d="M455 760 L635 775 L620 840 L440 825 Z" fill="#22d3ee" opacity="0.1" />
      <text x="80" y="112" fill="#e2e8f0" font-family="Inter, Arial, sans-serif" font-size="40" letter-spacing="8" opacity="0.58">MANGASTUDIO</text>
      <text x="80" y="174" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="800">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}