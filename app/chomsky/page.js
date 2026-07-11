"use client";
import { useState } from "react";
import Nav from "../components/Nav";
import { parseGrammarText, validateGrammar } from "../../lib/cfgEngine";
import { classifyChomsky, convertToCNF } from "../../lib/chomskyEngine";

const DEFAULT_GRAMMAR = `S -> A B
A -> a A | ε
B -> b B | b`;

export default function ChomskyPage() {
  const [grammarText, setGrammarText] = useState(DEFAULT_GRAMMAR);
  const [errors, setErrors] = useState([]);
  const [classification, setClassification] = useState(null);
  const [cnfResult, setCnfResult] = useState(null);

  function handleAnalyze() {
    const grammar = parseGrammarText(grammarText);
    const errs = validateGrammar(grammar);
    setErrors(errs);
    if (errs.length) { setClassification(null); setCnfResult(null); return; }
    setClassification(classifyChomsky(grammar));
    setCnfResult(convertToCNF(grammar));
  }

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-50">Modul 4 — Hierarki Chomsky & CNF</h1>
        <p className="mt-1 text-sm text-slate-400">
          Masukkan CFG bebas untuk diklasifikasikan dalam hierarki Chomsky (Tipe 0–3) dan dikonversi ke Chomsky Normal Form secara bertahap.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Grammar (CFG)</span>
              <textarea className="input h-40 font-mono" value={grammarText} onChange={(e) => setGrammarText(e.target.value)} />
            </label>
            <button onClick={handleAnalyze} className="btn-primary">Analisis & Konversi ke CNF</button>
            {errors.length > 0 && (
              <div className="rounded-md border border-red-800 bg-red-950/50 p-3 text-sm text-red-300">
                <ul className="ml-4 list-disc">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            {classification && (
              <div className="rounded-md border border-indigo-800 bg-indigo-950/40 p-3 text-sm">
                <p className="font-bold text-indigo-300">{classification.label}</p>
                <p className="mt-1 text-slate-400">{classification.reasoning}</p>
              </div>
            )}
            <HierarchyDiagram highlight={classification?.type} />
          </div>

          <div className="card">
            <h2 className="mb-3 font-semibold text-slate-200">Langkah Konversi ke CNF</h2>
            {cnfResult ? (
              <div className="max-h-[32rem] space-y-4 overflow-auto">
                {cnfResult.steps.map((s, i) => (
                  <div key={i} className="border-l-2 border-emerald-600/50 pl-3">
                    <p className="text-sm font-semibold text-emerald-300">{s.title}</p>
                    <p className="mb-1 text-xs text-slate-400">{s.description}</p>
                    <div className="space-y-0.5 font-mono text-xs text-slate-200">
                      {s.lines.map((l, j) => <div key={j}>{l}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Hasil konversi CNF akan muncul di sini.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function HierarchyDiagram({ highlight }) {
  const levels = [
    { type: 0, label: "Tipe 0 — Unrestricted Grammar", machine: "Turing Machine" },
    { type: 1, label: "Tipe 1 — Context-Sensitive Grammar", machine: "Linear Bounded Automaton" },
    { type: 2, label: "Tipe 2 — Context-Free Grammar", machine: "Pushdown Automaton" },
    { type: 3, label: "Tipe 3 — Regular Grammar", machine: "Finite State Automaton" },
  ];
  return (
    <div className="space-y-1 pt-2">
      {levels.map((l, i) => (
        <div
          key={l.type}
          className={`rounded-md border px-3 py-2 text-xs transition ${
            highlight === l.type
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
              : "border-slate-800 text-slate-500"
          }`}
          style={{ marginLeft: i * 16 }}
        >
          {l.label} <span className="text-slate-600">— {l.machine}</span>
        </div>
      ))}
    </div>
  );
}
