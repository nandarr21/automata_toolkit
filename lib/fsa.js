// ---------------------------------------------------------------------------
// Modul 1: Finite State Automata engine
// Model data mesin (dipakai untuk DFA, NFA, Moore, Mealy):
// {
//   type: 'DFA' | 'NFA' | 'MOORE' | 'MEALY',
//   states: string[],
//   alphabet: string[],
//   start: string,
//   accept: string[],                 // dipakai DFA/NFA
//   transitions: [{ from, symbol, to, output? }],  // symbol boleh 'ε' untuk NFA
//   stateOutputs: { [state]: output } // khusus MOORE
// }
// ---------------------------------------------------------------------------

export const EPSILON = "ε";

export function validateFSA(fsa) {
  const errors = [];
  if (!fsa.states?.length) errors.push("Minimal harus ada satu state.");
  if (!fsa.start) errors.push("State awal (q0) harus ditentukan.");
  if (fsa.start && !fsa.states.includes(fsa.start))
    errors.push(`State awal "${fsa.start}" tidak ada di daftar state.`);
  (fsa.accept || []).forEach((s) => {
    if (!fsa.states.includes(s))
      errors.push(`State akhir "${s}" tidak ada di daftar state.`);
  });
  (fsa.transitions || []).forEach((t, i) => {
    if (!fsa.states.includes(t.from))
      errors.push(`Transisi #${i + 1}: state asal "${t.from}" tidak valid.`);
    if (!fsa.states.includes(t.to))
      errors.push(`Transisi #${i + 1}: state tujuan "${t.to}" tidak valid.`);
    if (t.symbol !== EPSILON && !fsa.alphabet.includes(t.symbol))
      errors.push(
        `Transisi #${i + 1}: simbol "${t.symbol}" tidak ada di alfabet.`
      );
  });
  return errors;
}

function transitionsFrom(fsa, state, symbol) {
  return fsa.transitions
    .filter((t) => t.from === state && t.symbol === symbol)
    .map((t) => t.to);
}

export function epsilonClosure(fsa, states) {
  const stack = [...states];
  const closure = new Set(states);
  while (stack.length) {
    const s = stack.pop();
    transitionsFrom(fsa, s, EPSILON).forEach((t) => {
      if (!closure.has(t)) {
        closure.add(t);
        stack.push(t);
      }
    });
  }
  return closure;
}

// --- DFA simulation (deterministic, no epsilon) ---
export function simulateDFA(fsa, input) {
  let current = fsa.start;
  const trace = [{ step: 0, state: current, symbolRead: null }];
  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const nexts = transitionsFrom(fsa, current, symbol);
    if (nexts.length === 0) {
      return {
        accepted: false,
        trace,
        error: `Tidak ada transisi dari state "${current}" dengan simbol "${symbol}" (input ditolak / stuck).`,
      };
    }
    current = nexts[0];
    trace.push({ step: i + 1, state: current, symbolRead: symbol });
  }
  const accepted = fsa.accept.includes(current);
  return { accepted, trace, finalState: current };
}

// --- NFA simulation (supports epsilon, multiple transitions) ---
export function simulateNFA(fsa, input) {
  let currentSet = epsilonClosure(fsa, [fsa.start]);
  const trace = [{ step: 0, states: [...currentSet], symbolRead: null }];
  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    let next = new Set();
    currentSet.forEach((s) => {
      transitionsFrom(fsa, s, symbol).forEach((t) => next.add(t));
    });
    next = epsilonClosure(fsa, [...next]);
    if (next.size === 0) {
      return {
        accepted: false,
        trace,
        error: `Semua cabang mati setelah membaca simbol "${symbol}" pada posisi ${i}.`,
      };
    }
    currentSet = next;
    trace.push({ step: i + 1, states: [...currentSet], symbolRead: symbol });
  }
  const accepted = [...currentSet].some((s) => fsa.accept.includes(s));
  return { accepted, trace, finalStates: [...currentSet] };
}

export function simulate(fsa, input) {
  if (fsa.type === "DFA") return simulateDFA(fsa, input);
  return simulateNFA(fsa, input); // NFA, and used as fallback engine for Moore/Mealy base transitions
}

// --- NFA -> DFA subset construction ---
export function nfaToDfa(nfa) {
  const startSet = epsilonClosure(nfa, [nfa.start]);
  const key = (set) => [...set].sort().join(",");

  const dfaStatesMap = new Map(); // key -> {name, set}
  const dfaTransitions = [];
  const queue = [startSet];
  dfaStatesMap.set(key(startSet), { name: `{${[...startSet].sort().join(",")}}`, set: startSet });

  while (queue.length) {
    const currentSet = queue.shift();
    const currentKey = key(currentSet);
    const currentName = dfaStatesMap.get(currentKey).name;

    nfa.alphabet.forEach((symbol) => {
      let moveSet = new Set();
      currentSet.forEach((s) => {
        transitionsFrom(nfa, s, symbol).forEach((t) => moveSet.add(t));
      });
      moveSet = epsilonClosure(nfa, [...moveSet]);
      if (moveSet.size === 0) return; // dead, omit (implicit trap)

      const mKey = key(moveSet);
      if (!dfaStatesMap.has(mKey)) {
        const name = `{${[...moveSet].sort().join(",")}}`;
        dfaStatesMap.set(mKey, { name, set: moveSet });
        queue.push(moveSet);
      }
      dfaTransitions.push({
        from: currentName,
        symbol,
        to: dfaStatesMap.get(mKey).name,
      });
    });
  }

  const dfaStates = [...dfaStatesMap.values()];
  const accept = dfaStates
    .filter((ds) => [...ds.set].some((s) => nfa.accept.includes(s)))
    .map((ds) => ds.name);

  return {
    type: "DFA",
    states: dfaStates.map((d) => d.name),
    alphabet: nfa.alphabet,
    start: dfaStatesMap.get(key(startSet)).name,
    accept,
    transitions: dfaTransitions,
    subsetMap: dfaStates.map((d) => ({ name: d.name, set: [...d.set] })),
  };
}

// --- Moore Machine: output attached to state, produced on entering ---
export function runMoore(fsa, input) {
  let current = fsa.start;
  const outputs = [fsa.stateOutputs?.[current] ?? ""];
  const trace = [{ state: current, output: outputs[0], symbolRead: null }];
  for (const symbol of input) {
    const nexts = transitionsFrom(fsa, current, symbol);
    if (nexts.length === 0)
      return { outputs, trace, error: `Tidak ada transisi dari "${current}" dengan "${symbol}".` };
    current = nexts[0];
    const out = fsa.stateOutputs?.[current] ?? "";
    outputs.push(out);
    trace.push({ state: current, output: out, symbolRead: symbol });
  }
  return { outputs, trace, outputString: outputs.join("") };
}

// --- Mealy Machine: output attached to transition ---
export function runMealy(fsa, input) {
  let current = fsa.start;
  const outputs = [];
  const trace = [{ state: current, output: null, symbolRead: null }];
  for (const symbol of input) {
    const t = fsa.transitions.find((t) => t.from === current && t.symbol === symbol);
    if (!t)
      return { outputs, trace, error: `Tidak ada transisi dari "${current}" dengan "${symbol}".` };
    outputs.push(t.output ?? "");
    current = t.to;
    trace.push({ state: current, output: t.output ?? "", symbolRead: symbol });
  }
  return { outputs, trace, outputString: outputs.join("") };
}
