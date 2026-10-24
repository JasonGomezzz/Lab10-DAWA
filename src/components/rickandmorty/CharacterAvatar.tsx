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
  // Para resultados de búsqueda: la imagen solo se pide si la tarjeta entra en pantalla
  // y se mantiene `delay` ms, así las listas intermedias mientras se escribe no gastan peticiones
  gated?: boolean;
  delay?: number;
}

export default function CharacterAvatar({
  src,
  alt,
  sizes,
  loading = "lazy",
  gated = false,
  delay = 0,
}: CharacterAvatarProps) {
  const [attempt, setAttempt] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [armed, setArmed] = useState(!gated);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(retryTimer.current), []);

  useEffect(() => {
    const node = placeholderRef.current;
    if (armed || !node) return;

    let armTimer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        armTimer = setTimeout(() => setArmed(true), delay);
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      clearTimeout(armTimer);
    };
  }, [armed, delay]);

  function handleError() {
    setHasError(true);

    if (attempt < MAX_RETRIES) {
      retryTimer.current = setTimeout(() => {
        setAttempt((current) => current + 1);
        setHasError(false);
      }, RETRY_DELAY_MS * (attempt + 1));
    }
  }

  if (!armed) {
    return <div ref={placeholderRef} className="absolute inset-0 animate-pulse bg-white/5" />;
  }

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center rm-text-faint ${
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
      ref={(img) => {
        // Si aún no terminó de cargar, se oculta hasta que emerja del portal
        if (img && !img.complete) img.dataset.state = "loading";
      }}
      src={attempt ? `${src}?retry=${attempt}` : src}
      alt={alt}
      fill
      sizes={sizes}
      loading={loading}
      unoptimized // los avatares ya son pequeños; evita que el optimizador sature la API (429)
      onLoad={(event) => {
        event.currentTarget.dataset.state = "ready";
      }}
      onError={handleError}
      className="rm-photo object-cover"
    />
  );
}
