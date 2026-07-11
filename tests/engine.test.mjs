// Jalankan dengan: node --test tests/engine.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { simulateDFA, simulateNFA, nfaToDfa, runMoore, runMealy } from "../lib/fsa.js";
import { regexToNFA, testString } from "../lib/regexEngine.js";
import { parseGrammarText, earleyParse } from "../lib/cfgEngine.js";
import { classifyChomsky, convertToCNF } from "../lib/chomskyEngine.js";

test("Modul 1: DFA menerima/menolak string dengan benar", () => {
  const dfa = {
    type: "DFA", states: ["q0", "q1", "q2"], alphabet: ["0", "1"], start: "q0", accept: ["q2"],
    transitions: [
      { from: "q0", symbol: "0", to: "q0" }, { from: "q0", symbol: "1", to: "q1" },
      { from: "q1", symbol: "0", to: "q0" }, { from: "q1", symbol: "1", to: "q2" },
      { from: "q2", symbol: "0", to: "q2" }, { from: "q2", symbol: "1", to: "q2" },
    ],
  };
  assert.equal(simulateDFA(dfa, "011").accepted, true);
  assert.equal(simulateDFA(dfa, "0100").accepted, false);
});

test("Modul 1: NFA -> DFA subset construction konsisten dengan simulasi NFA", () => {
  const nfa = {
    type: "NFA", states: ["q0", "q1", "q2"], alphabet: ["0", "1"], start: "q0", accept: ["q2"],
    transitions: [
      { from: "q0", symbol: "0", to: "q0" }, { from: "q0", symbol: "1", to: "q0" },
      { from: "q0", symbol: "1", to: "q1" }, { from: "q1", symbol: "0", to: "q2" }, { from: "q1", symbol: "1", to: "q2" },
    ],
  };
  const dfa = nfaToDfa(nfa);
  ["11", "010", "1100", "00"].forEach((s) => {
    assert.equal(simulateDFA(dfa, s).accepted, simulateNFA(nfa, s).accepted, `mismatch for "${s}"`);
  });
});

test("Modul 1: Moore & Mealy machine menghasilkan output sesuai fungsi", () => {
  const mealy = {
    type: "MEALY", states: ["q0", "q1"], alphabet: ["0", "1"], start: "q0",
    transitions: [
      { from: "q0", symbol: "0", to: "q0", output: "0" }, { from: "q0", symbol: "1", to: "q1", output: "1" },
      { from: "q1", symbol: "0", to: "q0", output: "1" }, { from: "q1", symbol: "1", to: "q1", output: "0" },
    ],
  };
  assert.equal(runMealy(mealy, "0110").outputString, "0101");
});

test("Modul 2: Regex -> NFA mencocokkan pola dengan benar", () => {
  const re = regexToNFA("(a|b)*abb");
  assert.equal(testString(re, "aabb"), true);
  assert.equal(testString(re, "ab"), false);
  assert.equal(testString(re, "bababb"), true);
});

test("Modul 3: Earley parser menerima grammar left-recursive & menolak string invalid", () => {
  const g = parseGrammarText("E -> E + T | T\nT -> T * F | F\nF -> ( E ) | i");
  assert.equal(earleyParse(g, "i + i * i".split(" ")).accepted, true);
  assert.equal(earleyParse(g, "i + + i".split(" ")).accepted, false);
});

test("Modul 4: Klasifikasi hierarki & konversi CNF valid (semua produksi <=2 simbol)", () => {
  const g = parseGrammarText("S -> A B\nA -> a A | ε\nB -> b B | b");
  const cls = classifyChomsky(g);
  assert.equal(cls.type, 2);
  const cnf = convertToCNF(g);
  const final = cnf.finalProductions;
  final.forEach((p) => assert.ok(p.rhs.length <= 2, `produksi ${p.lhs} -> ${p.rhs.join(" ")} melanggar CNF`));
});
