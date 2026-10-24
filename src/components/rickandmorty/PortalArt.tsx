// Generador pseudoaleatorio con semilla: el portal sale igual en cada render (sin Math.random)
function seeded(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Contorno cerrado e irregular (curvas suaves Catmull-Rom) para los aros del portal
function blobPath(radius: number, wobble: number, seed: number, points = 9): string {
  const random = seeded(seed);
  const coords = Array.from({ length: points }, (_, index) => {
    const angle = (index / points) * Math.PI * 2;
    const r = radius + (random() - 0.5) * 2 * wobble;

    return [200 + Math.cos(angle) * r, 200 + Math.sin(angle) * r] as const;
  });

  let d = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;

  for (let i = 0; i < points; i++) {
    const p0 = coords[(i - 1 + points) % points];
    const p1 = coords[i];
    const p2 = coords[(i + 1) % points];
    const p3 = coords[(i + 2) % points];

    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }

  return `${d} Z`;
}

const RIM_A = blobPath(172, 9, 11);
const RIM_B = blobPath(184, 11, 29);
const RIM_C = blobPath(194, 8, 47, 11);

interface PortalArtProps {
  // "full" dibuja el portal completo; "rim" solo los aros (para enmarcar un retrato)
  variant?: "full" | "rim";
  // Identifica la instancia: Next mantiene varias rutas a la vez en el DOM y los ids de los
  // degradados (url(#...)) no pueden repetirse entre ellas
  uid?: string | number;
  className?: string;
}

export default function PortalArt({ variant = "full", uid = "hero", className }: PortalArtProps) {
  const id = `rm-portal-${variant}-${uid}`;

  return (
    <svg
      viewBox="0 0 400 400"
      className={`rm-portal-svg ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f3ffd0" />
          <stop offset="0.32" stopColor="#a8f35f" />
          <stop offset="0.68" stopColor="#2fb257" />
          <stop offset="1" stopColor="#0c4a34" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4ffb0" />
          <stop offset="0.5" stopColor="#8cf04a" />
          <stop offset="1" stopColor="#2be0a4" />
        </linearGradient>
      </defs>

      {variant === "full" && (
        <>
          <path d={RIM_A} fill={`url(#${id}-core)`} />
          <g className="rm-spin-c" fill="none" strokeLinecap="round">
            <path d="M 200 200 m -110 0 a 110 110 0 0 1 160 -98" stroke="#f3ffd0" strokeOpacity="0.55" strokeWidth="5" />
            <path d="M 200 200 m 82 22 a 86 86 0 0 1 -150 52" stroke="#e4ffb0" strokeOpacity="0.45" strokeWidth="4" />
            <path d="M 200 200 m -52 -40 a 62 62 0 0 1 104 -8" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="3" />
            <path d="M 200 200 m 30 46 a 38 38 0 0 1 -62 14" stroke="#f3ffd0" strokeOpacity="0.55" strokeWidth="3" />
          </g>
        </>
      )}

      <g className="rm-spin-a">
        <path d={RIM_A} fill="none" stroke={`url(#${id}-rim)`} strokeWidth="9" strokeLinejoin="round" />
      </g>
      <g className="rm-spin-b">
        <path d={RIM_B} fill="none" stroke="#d4ff8a" strokeOpacity="0.8" strokeWidth="3.5" strokeLinejoin="round" />
      </g>
      <g className="rm-spin-c">
        <path
          d={RIM_C}
          fill="none"
          stroke="#2be0a4"
          strokeOpacity="0.7"
          strokeWidth="2.5"
          strokeDasharray="14 10"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
