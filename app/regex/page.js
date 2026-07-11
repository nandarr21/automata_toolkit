"use client";
import { useState } from "react";
import Nav from "../components/Nav";
import StateDiagram from "../components/StateDiagram";
import { regexToNFA, testString, nfaToRegularGrammar } from "../../lib/regexEngine";

export default function RegexPage() {
  const [pattern, setPattern] = useState("(a|b)*abb");
  const [testInput, setTestInput] = useState("aabb");
  const [nfa, setNfa] = useState(null);
  const [grammar, setGrammar] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState("");

  function handleConvert() {
    setError("");
    try {
      const n = regexToNFA(pattern);
      setNfa(n);
      setGrammar(nfaToRegularGrammar(n));
      setMatchResult(null);
    } catch (e) {
      setError(e.message);
      setNfa(null);
    }
  }

  function handleTest() {
    if (!nfa) return;
    setMatchResult(testString(nfa, testInput));
  }

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-50">Modul 2 — Regular Expression</h1>
        <p className="mt-1 text-sm text-slate-400">
          Masukkan regular expression bebas (operator: <code className="text-emerald-400">| * + ? ( )</code>, alfanumerik sebagai simbol). Sistem mengonversinya ke NFA (Thompson&apos;s construction) dan menampilkan grammar reguler yang setara.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card space-y-4">
            <Field label="Regular Expression">
              <input className="input font-mono" value={pattern} onChange={(e) => setPattern(e.target.value)} />
            </Field>
            <button onClick={handleConvert} className="btn-primary">Konversi ke NFA</button>
            {error && <p className="text-sm text-red-400">{error}</p>}

            {nfa && (
              <>
                <Field label="String uji">
                  <div className="flex gap-2">
                    <input className="input font-mono" value={testInput} onChange={(e) => setTestInput(e.target.value)} />
                    <button onClick={handleTest} className="btn-secondary">Uji Cocok</button>
                  </div>
                </Field>
                {matchResult !== null && (
                  <p className={`font-bold ${matchResult ? "text-emerald-400" : "text-red-400"}`}>
                    {matchResult ? `✓ "${testInput}" COCOK dengan pola` : `✗ "${testInput}" TIDAK COCOK dengan pola`}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-slate-200">NFA Hasil Konversi</h2>
            {nfa ? (
              <>
                <StateDiagram states={nfa.states} start={nfa.start} accept={nfa.accept} transitions={nfa.transitions} />
                <p className="text-xs text-slate-500">
                  {nfa.states.length} state, alfabet Σ = {"{"}{nfa.alphabet.join(", ")}{"}"}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Belum ada NFA — klik &quot;Konversi ke NFA&quot;.</p>
            )}
          </div>
        </div>

        {grammar.length > 0 && (
          <div className="card mt-6">
            <h2 className="mb-3 font-semibold text-slate-200">Grammar Reguler Setara (Tipe 3 — Right-Linear)</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-sm text-indigo-300 sm:grid-cols-3">
              {grammar.map((r, i) => <div key={i}>{r}</div>)}
            </div>
          </div>
        )}
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
