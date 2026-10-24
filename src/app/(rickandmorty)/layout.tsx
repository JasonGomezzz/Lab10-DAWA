import { ReactNode } from "react";
import { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import { GiPortal } from "react-icons/gi";
import "./rickandmorty.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rick and Morty - Personajes",
    template: "%s | Rick and Morty",
  },
  description: "Explora y busca a los personajes de Rick and Morty",
};

interface RickAndMortyLayoutProps {
  children: ReactNode;
}

export default function RickAndMortyLayout({ children }: RickAndMortyLayoutProps) {
  return (
    <div className={`${bricolage.variable} rm-root flex flex-col`}>
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--rm-line)", background: "rgb(11 10 31 / 0.72)" }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" className="rm-display flex items-center gap-2.5 text-2xl">
            <GiPortal size={30} className="rm-text-portal" aria-hidden="true" />
            Rick and Morty
          </Link>
          <Link
            href="/pokemon"
            className="rounded-full px-4 py-2 text-sm font-medium rm-text-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rm-blue)]"
          >
            Ir a la Pokédex
          </Link>
        </nav>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t py-8 text-sm rm-text-faint" style={{ borderColor: "var(--rm-line)" }}>
        <p className="mx-auto max-w-7xl px-5 sm:px-8">
          Datos de la{" "}
          <a
            href="https://rickandmortyapi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rm-text-muted underline underline-offset-4 hover:text-white"
          >
            API de Rick and Morty
          </a>
          . Proyecto del Laboratorio 10 con Next.js.
        </p>
      </footer>
    </div>
  );
}
