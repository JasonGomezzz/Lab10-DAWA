import { ReactNode } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { GiPortal } from "react-icons/gi";
import { IoGameController } from "react-icons/io5";

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold transition-colors hover:text-lime-400"
          >
            <GiPortal size={28} className="text-lime-400" /> Rick and Morty
          </Link>
          <Link
            href="/pokemon"
            className="flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
          >
            <IoGameController size={18} /> Pokédex
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
