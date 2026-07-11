"use client";
import { useMemo, useState } from "react";
import Nav from "../components/Nav";
import StateDiagram from "../components/StateDiagram";
import {
  validateFSA,
  simulateDFA,
  simulateNFA,
  nfaToDfa,
  runMoore,
  runMealy,
  EPSILON,
} from "../../lib/fsa";

const EXAMPLES = {
  DFA: {
    states: "q0,q1,q2",
    alphabet: "0,1",
    start: "q0",
    accept: "q2",
    transitions: "q0,0,q0\nq0,1,q1\nq1,0,q0\nq1,1,q2\nq2,0,q2\nq2,1,q2",
    stateOutputs: "",
  },
  NFA: {
    states: "q0,q1,q2",
    alphabet: "0,1",
    start: "q0",
    accept: "q2",
    transitions: `q0,0,q0\nq0,1,q0\nq0,1,q1\nq1,0,q2\nq1,1,q2\nq0,${EPSILON},q1`,
    stateOutputs: "",
  },
  MOORE: {
    states: "q0,q1,q2",
    alphabet: "0,1",
    start: "q0",
    accept: "",
    transitions: "q0,0,q0\nq0,1,q1\nq1,0,q2\nq1,1,q1\nq2,0,q2\nq2,1,q1",
    stateOutputs: "q0:0\nq1:0\nq2:1",
  },
  MEALY: {
    states: "q0,q1",
    alphabet: "0,1",
    start: "q0",
    accept: "",
    transitions: "q0,0,q0,0\nq0,1,q1,1\nq1,0,q0,1\nq1,1,q1,0",
    stateOutputs: "",
  },
};

function parseList(s) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function parseTransitions(text, withOutput) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (withOutput) {
        const [from, symbol, to, output] = parts;
        return { from, symbol, to, output: output ?? "" };
      }
      const [from, symbol, to] = parts;
      return { from, symbol, to };
    });
}

function parseStateOutputs(text) {
  const map = {};
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((l) => {
      const [state, out] = l.split(":").map((x) => x.trim());
      if (state) map[state] = out ?? "";
    });
  return map;
}

export default function FSAPage() {
  const [type, setType] = useState("DFA");
  const [form, setForm] = useState(EXAMPLES.DFA);
  const [testInput, setTestInput] = useState("0110");
  const [result, setResult] = useState(null);
  const [dfaFromNfa, setDfaFromNfa] = useState(null);

  const fsa = useMemo(() => {
    const withOutput = type === "MEALY";
    return {
      type,
      states: parseList(form.states),
      alphabet: parseList(form.alphabet),
      start: form.start.trim(),
      accept: parseList(form.accept),
      transitions: parseTransitions(form.transitions, withOutput),
      stateOutputs: type === "MOORE" ? parseStateOutputs(form.stateOutputs) : undefined,
    };
  }, [type, form]);

  const errors = useMemo(() => validateFSA(fsa), [fsa]);

  function loadExample(t) {
    setType(t);
    setForm(EXAMPLES[t]);
    setResult(null);
    setDfaFromNfa(null);
  }

  function handleRun() {
    if (errors.length) return;
    let r;
    if (type === "DFA") r = simulateDFA(fsa, testInput);
    else if (type === "NFA") r = simulateNFA(fsa, testInput);
    else if (type === "MOORE") r = runMoore(fsa, testInput);
    else if (type === "MEALY") r = runMealy(fsa, testInput);
    setResult(r);
    setDfaFromNfa(null);
  }

  function handleConvert() {
    if (errors.length) return;
    setDfaFromNfa(nfaToDfa(fsa));
  }

  const activeStates = useMemo(() => {
    if (!result) return [];
    if (result.finalState) return [result.finalState];
    if (result.finalStates) return result.finalStates;
    if (result.trace?.length) {
      const last = result.trace[result.trace.length - 1];
      return last.state ? [last.state] : last.states || [];
    }
    return [];
  }, [result]);

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-50">Modul 1 — Finite State Automata</h1>
        <p className="mt-1 text-sm text-slate-400">
          Definisikan mesin (DFA, NFA, Moore, atau Mealy) secara bebas, lalu uji dengan string input. Untuk NFA tersedia konversi ke DFA (subset construction).
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {Object.keys(EXAMPLES).map((t) => (
            <button
              key={t}
              onClick={() => loadExample(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                type === t ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* FORM */}
          <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <Field label="States (pisahkan koma)">
              <input className="input" value={form.states} onChange={(e) => setForm({ ...form, states: e.target.value })} />
            </Field>
            <Field label="Alfabet Σ (pisahkan koma)">
              <input className="input" value={form.alphabet} onChange={(e) => setForm({ ...form, alphabet: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State awal (q0)">
                <input className="input" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </Field>
              {(type === "DFA" || type === "NFA") && (
                <Field label="State akhir F (koma)">
                  <input className="input" value={form.accept} onChange={(e) => setForm({ ...form, accept: e.target.value })} />
                </Field>
              )}
            </div>
            {type === "MOORE" && (
              <Field label="Output per state (format: state:output, satu per baris)">
                <textarea className="input h-24 font-mono" value={form.stateOutputs} onChange={(e) => setForm({ ...form, stateOutputs: e.target.value })} />
              </Field>
            )}
            <Field label={`Fungsi transisi δ (format: from,simbol,to${type === "MEALY" ? ",output" : ""} — satu per baris${type === "NFA" ? `, gunakan "${EPSILON}" untuk epsilon` : ""})`}>
              <textarea className="input h-40 font-mono" value={form.transitions} onChange={(e) => setForm({ ...form, transitions: e.target.value })} />
            </Field>

            {errors.length > 0 && (
              <div className="rounded-md border border-red-800 bg-red-950/50 p-3 text-sm text-red-300">
                <p className="font-semibold">Definisi mesin tidak valid:</p>
                <ul className="ml-4 list-disc">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <Field label="String uji">
              <div className="flex gap-2">
                <input className="input" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
                <button onClick={handleRun} disabled={!!errors.length} className="btn-primary">Jalankan</button>
                {type === "NFA" && (
                  <button onClick={handleConvert} disabled={!!errors.length} className="btn-secondary">NFA→DFA</button>
                )}
              </div>
            </Field>
          </div>

          {/* RESULT */}
          <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="font-semibold text-slate-200">Visualisasi & Hasil</h2>
            {fsa.states.length > 0 && !errors.length && (
              <StateDiagram
                states={fsa.states}
                start={fsa.start}
                accept={fsa.accept}
                transitions={fsa.transitions.filter((t) => t.symbol !== EPSILON || true)}
                activeStates={activeStates}
              />
            )}

            {result && (
              <div className="space-y-2 text-sm">
                {"accepted" in result && (
                  <p className={`font-bold ${result.accepted ? "text-emerald-400" : "text-red-400"}`}>
                    {result.accepted ? "✓ DITERIMA (Accepted)" : "✗ DITOLAK (Rejected)"}
                  </p>
                )}
                {result.outputString !== undefined && (
                  <p className="text-emerald-300">Output: <span className="font-mono">{result.outputString}</span></p>
                )}
                {result.error && <p className="text-amber-400">{result.error}</p>}
                <p className="font-semibold text-slate-300">Trace transisi:</p>
                <div className="max-h-48 overflow-auto rounded border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-400">
                      <tr><th className="p-2">Langkah</th><th className="p-2">Simbol</th><th className="p-2">State</th>{result.trace[0]?.output !== undefined && <th className="p-2">Output</th>}</tr>
                    </thead>
                    <tbody>
                      {result.trace.map((row, i) => (
                        <tr key={i} className="border-t border-slate-800">
                          <td className="p-2">{row.step ?? i}</td>
                          <td className="p-2 font-mono">{row.symbolRead ?? "—"}</td>
                          <td className="p-2 font-mono">{row.state ?? (row.states || []).join(", ")}</td>
                          {row.output !== undefined && <td className="p-2 font-mono">{row.output}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dfaFromNfa && (
              <div className="space-y-2 border-t border-slate-800 pt-4 text-sm">
                <p className="font-semibold text-indigo-300">Hasil konversi NFA → DFA (subset construction)</p>
                <StateDiagram
                  states={dfaFromNfa.states}
                  start={dfaFromNfa.start}
                  accept={dfaFromNfa.accept}
                  transitions={dfaFromNfa.transitions}
                />
                <p className="text-xs text-slate-400">Setiap state DFA merepresentasikan himpunan (subset) state NFA:</p>
                <ul className="ml-4 list-disc text-xs text-slate-400">
                  {dfaFromNfa.subsetMap.map((m) => (
                    <li key={m.name}><span className="font-mono text-indigo-300">{m.name}</span> = {"{"}{m.set.join(", ")}{"}"}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}
