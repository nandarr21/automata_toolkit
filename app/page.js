import Link from "next/link";
import Nav from "./components/Nav";

const modules = [
  { href: "/fsa", title: "1. Finite State Automata", desc: "Simulator DFA/NFA, konversi NFA→DFA, Moore & Mealy Machine." },
  { href: "/regex", title: "2. Regular Expression", desc: "Konversi RE ke NFA (Thompson's construction) + grammar reguler setara." },
  { href: "/cfg", title: "3. Pushdown Automata & CFG", desc: "Parser CFG umum, derivasi leftmost, dan pohon penurunan." },
  { href: "/chomsky", title: "4. Hierarki Chomsky & CNF", desc: "Klasifikasi Tipe 0–3 dan konversi CFG ke Chomsky Normal Form bertahap." },
];

export default function Home() {
  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-50">Automata Toolkit</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Capstone Project Individu — Teori Bahasa dan Otomata. Aplikasi ini mengintegrasikan empat modul inti dan
          menerima definisi mesin / grammar bebas dari pengguna.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-emerald-600 hover:bg-slate-900"
            >
              <h2 className="font-semibold text-slate-100 group-hover:text-emerald-400">{m.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
