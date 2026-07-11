// ---------------------------------------------------------------------------
// Modul 3: CFG & PDA engine
// Format grammar (ditulis user), simbol dipisah spasi, alternatif dgn '|':
//   E -> E + T | T
//   T -> T * F | F
//   F -> ( E ) | i
// epsilon ditulis sebagai: ε   atau   eps
// ---------------------------------------------------------------------------

export function parseGrammarText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const productions = [];
  const nonTerminals = new Set();
  let start = null;

  lines.forEach((line) => {
    const arrowMatch = line.split(/->|→/);
    if (arrowMatch.length < 2) return;
    const lhs = arrowMatch[0].trim();
    if (!start) start = lhs;
    nonTerminals.add(lhs);
    const alts = arrowMatch.slice(1).join("->").split("|");
    alts.forEach((alt) => {
      const symbols = alt.trim().split(/\s+/).filter(Boolean);
      const isEpsilon = symbols.length === 0 || (symbols.length === 1 && (symbols[0] === "ε" || symbols[0].toLowerCase() === "eps"));
      productions.push({ lhs, rhs: isEpsilon ? [] : symbols });
    });
  });

  // second pass now that all LHS known, terminals = symbols not in nonTerminals
  const terminals = new Set();
  productions.forEach((p) => p.rhs.forEach((s) => { if (!nonTerminals.has(s)) terminals.add(s); }));

  return { productions, nonTerminals: [...nonTerminals], terminals: [...terminals], start };
}

export function validateGrammar(grammar) {
  const errors = [];
  if (!grammar.productions.length) errors.push("Grammar kosong / format tidak dikenali. Gunakan format: LHS -> simbol1 simbol2 | simbol3");
  if (!grammar.start) errors.push("Simbol awal (start symbol) tidak ditemukan.");
  return errors;
}

// --- Earley parser dengan ekstraksi satu parse tree (menangani left-recursion & epsilon) ---
export function earleyParse(grammar, tokens) {
  const AUG = "S'";
  const rules = [{ lhs: AUG, rhs: [grammar.start] }, ...grammar.productions];
  const rulesByLhs = new Map();
  rules.forEach((r, i) => {
    if (!rulesByLhs.has(r.lhs)) rulesByLhs.set(r.lhs, []);
    rulesByLhs.get(r.lhs).push(i);
  });
  const isNonTerminal = (s) => grammar.nonTerminals.includes(s);
  const n = tokens.length;
  const columns = Array.from({ length: n + 1 }, () => new Map());

  function addItem(col, ruleIdx, dot, origin, derivation) {
    const key = `${ruleIdx}|${dot}|${origin}`;
    if (columns[col].has(key)) return null;
    const item = { ruleIdx, dot, origin, derivation, key };
    columns[col].set(key, item);
    return item;
  }

  addItem(0, 0, 0, 0, []);

  for (let k = 0; k <= n; k++) {
    const queue = [...columns[k].values()];
    for (let qi = 0; qi < queue.length; qi++) {
      const item = queue[qi];
      const rule = rules[item.ruleIdx];
      if (item.dot < rule.rhs.length) {
        const sym = rule.rhs[item.dot];
        if (isNonTerminal(sym)) {
          // PREDICT
          (rulesByLhs.get(sym) || []).forEach((rIdx) => {
            const newItem = addItem(k, rIdx, 0, k, []);
            if (newItem) queue.push(newItem);
          });
        } else {
          // SCAN
          if (k < n && tokens[k] === sym) {
            const newItem = addItem(k + 1, item.ruleIdx, item.dot + 1, item.origin, [
              ...item.derivation,
              { terminal: true, symbol: sym },
            ]);
            // newItem added to a future column; will be queued when that column processed
          }
        }
      } else {
        // COMPLETE
        const B = rule.lhs;
        const completedNode = { symbol: B, children: item.derivation, start: item.origin, end: k };
        [...columns[item.origin].values()].forEach((srcItem) => {
          const srcRule = rules[srcItem.ruleIdx];
          if (srcItem.dot < srcRule.rhs.length && srcRule.rhs[srcItem.dot] === B) {
            const newItem = addItem(k, srcItem.ruleIdx, srcItem.dot + 1, srcItem.origin, [
              ...srcItem.derivation,
              completedNode,
            ]);
            // newItem lands in the current column k being processed -> queue it so it's expanded too
            if (newItem) queue.push(newItem);
          }
        });
      }
    }
  }

  const finalKey = [...columns[n].values()].find((it) => it.ruleIdx === 0 && it.dot === 1 && it.origin === 0);
  if (!finalKey) return { accepted: false, tree: null, derivationSteps: [] };

  const tree = finalKey.derivation[0]; // child under augmented start = actual parse tree rooted at grammar.start
  const derivationSteps = buildLeftmostDerivation(tree);
  return { accepted: true, tree, derivationSteps };
}

function buildLeftmostDerivation(root) {
  let form = [{ type: "nonterminal", symbol: root.symbol, node: root }];
  const steps = [form.map((f) => f.symbol).join(" ")];
  let guard = 0;
  while (form.some((f) => f.type === "nonterminal") && guard < 500) {
    guard++;
    const i = form.findIndex((f) => f.type === "nonterminal");
    const node = form[i].node;
    const replacement = (node.children || []).map((c) =>
      c.terminal ? { type: "terminal", symbol: c.symbol } : { type: "nonterminal", symbol: c.symbol, node: c }
    );
    form = [...form.slice(0, i), ...replacement, ...form.slice(i + 1)];
    steps.push(form.length ? form.map((f) => f.symbol).join(" ") : "ε");
  }
  return steps;
}
