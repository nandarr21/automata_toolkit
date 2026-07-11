"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/fsa", label: "1. FSA" },
  { href: "/regex", label: "2. Regex" },
  { href: "/cfg", label: "3. PDA & CFG" },
  { href: "/chomsky", label: "4. Chomsky & CNF" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3">
        <span className="mr-4 font-semibold tracking-tight text-emerald-400">
          Automata Toolkit
        </span>
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
