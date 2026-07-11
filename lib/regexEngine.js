import { EPSILON, epsilonClosure } from "./fsa.js";

// ---------------------------------------------------------------------------
// Modul 2: Regular Expression engine
// Mendukung operator: | (union), * (kleene star), + (satu atau lebih),
// ? (opsional), () (grouping), konkatenasi implisit. Alfabet = alfanumerik.
// ---------------------------------------------------------------------------

function insertConcat(regex) {
  let out = "";
  for (let i = 0; i < regex.length; i++) {
    const c = regex[i];
    out += c;
    if (i + 1 >= regex.length) continue;
    const next = regex[i + 1];
    const isOperand = (ch) => /[a-zA-Z0-9]/.test(ch) || ch === "(";
    const endsOperand = (ch) => /[a-zA-Z0-9)*+?]/.test(ch);
    if (endsOperand(c) && isOperand(next)) out += ".";
  }
  return out;
}

function toPostfix(regex) {
  const prec = { "|": 1, ".": 2, "*": 3, "+": 3, "?": 3 };
  const output = [];
  const stack = [];
  for (const c of regex) {
    if (/[a-zA-Z0-9]/.test(c)) {
      output.push(c);
    } else if (c === "(") {
      stack.push(c);
    } else if (c === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") output.push(stack.pop());
      stack.pop();
    } else {
      while (
        stack.length &&
        stack[stack.length - 1] !== "(" &&
        prec[stack[stack.length - 1]] >= prec[c]
      ) {
        output.push(stack.pop());
      }
      stack.push(c);
    }
  }
  while (stack.length) output.push(stack.pop());
  return output;
}

// Thompson's construction: builds an NFA fragment { start, accept, transitions, states }
export function regexToNFA(regex) {
  if (!regex.trim()) throw new Error("Regular expression kosong.");
  const withConcat = insertConcat(regex.replace(/\s+/g, ""));
  const postfix = toPostfix(withConcat);

  let stateCounter = 0;
  const newState = () => `q${stateCounter++}`;
  const allTransitions = [];
  const stack = [];

  const addT = (from, symbol, to) => allTransitions.push({ from, symbol, to });

  for (const token of postfix) {
    if (/[a-zA-Z0-9]/.test(token)) {
      const s = newState();
      const a = newState();
      addT(s, token, a);
      stack.push({ start: s, accept: a });
    } else if (token === ".") {
      const b = stack.pop();
      const a = stack.pop();
      addT(a.accept, EPSILON, b.start);
      stack.push({ start: a.start, accept: b.accept });
    } else if (token === "|") {
      const b = stack.pop();
      const a = stack.pop();
      const s = newState();
      const acc = newState();
      addT(s, EPSILON, a.start);
      addT(s, EPSILON, b.start);
      addT(a.accept, EPSILON, acc);
      addT(b.accept, EPSILON, acc);
      stack.push({ start: s, accept: acc });
    } else if (token === "*") {
      const a = stack.pop();
      const s = newState();
      const acc = newState();
      addT(s, EPSILON, a.start);
      addT(s, EPSILON, acc);
      addT(a.accept, EPSILON, a.start);
      addT(a.accept, EPSILON, acc);
      stack.push({ start: s, accept: acc });
    } else if (token === "+") {
      const a = stack.pop();
      const s = newState();
      const acc = newState();
      addT(s, EPSILON, a.start);
      addT(a.accept, EPSILON, a.start);
      addT(a.accept, EPSILON, acc);
      stack.push({ start: s, accept: acc });
    } else if (token === "?") {
      const a = stack.pop();
      const s = newState();
      const acc = newState();
      addT(s, EPSILON, a.start);
      addT(s, EPSILON, acc);
      addT(a.accept, EPSILON, acc);
      stack.push({ start: s, accept: acc });
    } else {
      throw new Error(`Token tidak dikenal: "${token}"`);
    }
  }

  if (stack.length !== 1) throw new Error("Regular expression tidak valid (operand/operator tidak seimbang).");
  const frag = stack.pop();
  const states = new Set();
  allTransitions.forEach((t) => { states.add(t.from); states.add(t.to); });
  states.add(frag.start);
  states.add(frag.accept);
  const alphabet = [...new Set(allTransitions.filter((t) => t.symbol !== EPSILON).map((t) => t.symbol))];

  return {
    type: "NFA",
    states: [...states],
    alphabet,
    start: frag.start,
    accept: [frag.accept],
    transitions: allTransitions,
    postfix,
  };
}

export function testString(nfa, input) {
  let currentSet = epsilonClosure(nfa, [nfa.start]);
  for (const symbol of input) {
    let next = new Set();
    currentSet.forEach((s) => {
      nfa.transitions
        .filter((t) => t.from === s && t.symbol === symbol)
        .forEach((t) => next.add(t.to));
    });
    currentSet = epsilonClosure(nfa, [...next]);
    if (currentSet.size === 0) return false;
  }
  return [...currentSet].some((s) => nfa.accept.includes(s));
}

// Generate equivalent right-linear (Type 3) regular grammar from the NFA
export function nfaToRegularGrammar(nfa) {
  const rules = [];
  nfa.transitions.forEach((t) => {
    if (t.symbol === EPSILON) {
      rules.push(`${t.from} → ${t.to}`); // unit production via epsilon
    } else {
      rules.push(`${t.from} → ${t.symbol} ${t.to}`);
    }
  });
  nfa.accept.forEach((a) => rules.push(`${a} → ε`));
  return rules;
}
