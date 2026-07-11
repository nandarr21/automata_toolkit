"use client";
import { useState } from "react";
import Nav from "../components/Nav";
import TreeDiagram from "../components/TreeDiagram";
import { parseGrammarText, validateGrammar, earleyParse } from "../../lib/cfgEngine";

const DEFAULT_GRAMMAR = `E -> E + T | T
T -> T * F | F
F -> ( E ) | i`;

export default function CFGPage() {
  const [grammarText, setGrammarText] = useState(DEFAULT_GRAMMAR);
  const [testInput, setTestInput] = useState("i + i * i");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  function handleParse() {
    const grammar = parseGrammarText(grammarText);
    const errs = validateGrammar(grammar);
    setErrors(errs);
    if (errs.length) { setResult(null); return; }
    const tokens = testInput.trim().split(/\s+/).filter(Boolean);
    const r = earleyParse(grammar, tokens);
    setResult(r);
  }

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-50">Modul 3 — Pushdown Automata & CFG</h1>
        <p className="mt-1 text-sm text-slate-400">
          Definisikan CFG bebas (satu produksi per baris, simbol dipisah spasi, alternatif dengan <code className="text-emerald-400">|</code>, epsilon = <code className="text-emerald-400">ε</code>). Parser (setara PDA non-deterministik / algoritma Earley) menerima string berdasarkan grammar ini, lalu menampilkan derivasi leftmost dan pohon penurunan.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card space-y-4">
            <Field label="Grammar (CFG)">
              <textarea className="input h-40 font-mono" value={grammarText} onChange={(e) => setGrammarText(e.target.value)} />
            </Field>
            <Field label="String uji (token dipisah spasi)">
              <input className="input font-mono" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
            </Field>
            <button onClick={handleParse} className="btn-primary">Parse String</button>
            {errors.length > 0 && (
              <div className="rounded-md border border-red-800 bg-red-950/50 p-3 text-sm text-red-300">
                <ul className="ml-4 list-disc">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            {result && (
              <p className={`font-bold ${result.accepted ? "text-emerald-400" : "text-red-400"}`}>
                {result.accepted ? "✓ String DITERIMA oleh grammar" : "✗ String DITOLAK — tidak ada derivasi yang valid"}
              </p>
            )}
            {result?.accepted && (
              <div>
                <p className="mb-1 font-semibold text-slate-300">Derivasi Leftmost:</p>
                <div className="max-h-56 space-y-1 overflow-auto rounded border border-slate-800 p-2 font-mono text-xs text-indigo-300">
                  {result.derivationSteps.map((s, i) => (
                    <div key={i}>{i === 0 ? "" : "⇒ "}{s}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3 font-semibold text-slate-200">Pohon Penurunan (Parse Tree)</h2>
            {result?.accepted ? (
              <TreeDiagram tree={result.tree} />
            ) : (
              <p className="text-sm text-slate-500">Parse tree akan muncul di sini setelah string diterima.</p>
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
