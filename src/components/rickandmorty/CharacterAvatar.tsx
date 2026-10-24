"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GiAlienStare } from "react-icons/gi";

// La API limita las peticiones por ráfaga (429): si un avatar falla se reintenta con
// una espera creciente en lugar de dejar la imagen rota
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 4000;

interface CharacterAvatarProps {
  src: string;
  alt: string;
  sizes: string;
  loading?: "lazy" | "eager";
}

export default function CharacterAvatar({
  src,
  alt,
  sizes,
  loading = "lazy",
}: CharacterAvatarProps) {
  const [attempt, setAttempt] = useState(0);
  const [hasError, setHasError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleError() {
    setHasError(true);

    if (attempt < MAX_RETRIES) {
      timer.current = setTimeout(() => {
        setAttempt((current) => current + 1);
        setHasError(false);
      }, RETRY_DELAY_MS * (attempt + 1));
    }
  }

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center text-slate-600 ${
          attempt < MAX_RETRIES ? "animate-pulse" : ""
        }`}
      >
        <GiAlienStare size={56} />
      </div>
    );
  }

  return (
    <Image
      // key y ?retry fuerzan una petición nueva en cada reintento
      key={attempt}
      src={attempt ? `${src}?retry=${attempt}` : src}
      alt={alt}
      fill
      sizes={sizes}
      loading={loading}
      unoptimized // los avatares ya son pequeños; evita que el optimizador sature la API (429)
      onError={handleError}
      className="object-cover"
    />
  );
}
