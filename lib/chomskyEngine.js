// ---------------------------------------------------------------------------
// Modul 4: Hierarki Chomsky & Chomsky Normal Form (CNF)
// ---------------------------------------------------------------------------

export function classifyChomsky(grammar) {
  const { productions, nonTerminals } = grammar;
  // Grammar yang kita terima selalu berbentuk LHS tunggal non-terminal -> selalu minimal Tipe 2 (CFG).
  let rightLinear = true;
  let leftLinear = true;
  productions.forEach((p) => {
    const { rhs } = p;
    if (rhs.length === 0) return; // ε ok untuk keduanya
    if (rhs.length === 1) {
      if (nonTerminals.includes(rhs[0])) { rightLinear = false; leftLinear = false; }
      return;
    }
    if (rhs.length === 2) {
      const [a, b] = rhs;
      const aNT = nonTerminals.includes(a);
      const bNT = nonTerminals.includes(b);
      if (!(aNT === false && bNT === true)) rightLinear = false; // a B
      if (!(aNT === true && bNT === false)) leftLinear = false; // A b
      return;
    }
    rightLinear = false;
    leftLinear = false;
  });

  if (rightLinear || leftLinear) {
    return {
      type: 3,
      label: "Tipe 3 — Regular Grammar",
      reasoning: `Semua produksi berbentuk ${rightLinear ? "A → aB / A → a" : "A → Ba / A → a"} (linear ${rightLinear ? "kanan" : "kiri"}), sehingga grammar ini setara dengan Finite State Automata.`,
    };
  }
  return {
    type: 2,
    label: "Tipe 2 — Context-Free Grammar",
    reasoning: "Setiap produksi memiliki tepat satu simbol non-terminal di ruas kiri (LHS), namun pola ruas kanan tidak memenuhi bentuk linear kanan maupun kiri secara konsisten, sehingga grammar ini context-free namun tidak reguler.",
  };
}

function cloneProds(prods) {
  return prods.map((p) => ({ lhs: p.lhs, rhs: [...p.rhs] }));
}

function prodsToLines(prods) {
  const grouped = new Map();
  prods.forEach((p) => {
    if (!grouped.has(p.lhs)) grouped.set(p.lhs, []);
    grouped.get(p.lhs).push(p.rhs.length ? p.rhs.join(" ") : "ε");
  });
  return [...grouped.entries()].map(([lhs, alts]) => `${lhs} → ${alts.join(" | ")}`);
}

let counter = 0;
function freshName(prefix, used) {
  let name;
  do { name = `${prefix}${counter++}`; } while (used.has(name));
  used.add(name);
  return name;
}

export function convertToCNF(grammar) {
  counter = 0;
  const steps = [];
  const usedNames = new Set(grammar.nonTerminals);
  let prods = cloneProds(grammar.productions);
  const originalStart = grammar.start;

  steps.push({ title: "Grammar Awal", description: "CFG sebagaimana didefinisikan pengguna.", lines: prodsToLines(prods) });

  // --- STEP 1: START — pastikan simbol awal tidak muncul di ruas kanan manapun ---
  const startAppearsOnRHS = prods.some((p) => p.rhs.includes(originalStart));
  let start = originalStart;
  if (startAppearsOnRHS) {
    const newStart = freshName("S", usedNames);
    prods = [{ lhs: newStart, rhs: [originalStart] }, ...prods];
    start = newStart;
    steps.push({
      title: "1. START — Simbol Awal Baru",
      description: `Karena simbol awal "${originalStart}" muncul di ruas kanan suatu produksi, ditambahkan simbol awal baru "${newStart} → ${originalStart}".`,
      lines: prodsToLines(prods),
    });
  } else {
    steps.push({ title: "1. START", description: "Simbol awal tidak muncul di ruas kanan manapun — tidak perlu simbol awal baru.", lines: prodsToLines(prods) });
  }

  // --- STEP 2: DEL — eliminasi produksi epsilon (nullable) ---
  let nullable = new Set(prods.filter((p) => p.rhs.length === 0).map((p) => p.lhs));
  let changed = true;
  while (changed) {
    changed = false;
    prods.forEach((p) => {
      if (!nullable.has(p.lhs) && p.rhs.length > 0 && p.rhs.every((s) => nullable.has(s))) {
        nullable.add(p.lhs);
        changed = true;
      }
    });
  }
  const startNullable = nullable.has(start);

  function combinations(rhs) {
    const nullableIdx = rhs.map((s, i) => (nullable.has(s) ? i : -1)).filter((i) => i >= 0);
    const results = new Set();
    const total = 1 << nullableIdx.length;
    for (let mask = 0; mask < total; mask++) {
      const keepAll = rhs.filter((s, i) => {
        const idxInNullable = nullableIdx.indexOf(i);
        if (idxInNullable === -1) return true;
        return !((mask >> idxInNullable) & 1);
      });
      results.add(keepAll.join("\u0001"));
    }
    return [...results].map((s) => (s ? s.split("\u0001") : []));
  }

  let delProds = [];
  const seenDel = new Set();
  prods.forEach((p) => {
    if (p.rhs.length === 0) return; // drop original epsilon productions
    combinations(p.rhs).forEach((rhs) => {
      if (rhs.length === 0) return; // skip empty variant (epsilon removed)
      const key = `${p.lhs}->${rhs.join(" ")}`;
      if (!seenDel.has(key)) { seenDel.add(key); delProds.push({ lhs: p.lhs, rhs }); }
    });
  });
  if (startNullable) delProds.push({ lhs: start, rhs: [] }); // pertahankan ε hanya utk start jika bahasa memuat ε
  prods = delProds;
  steps.push({
    title: "2. DEL — Eliminasi Produksi-ε",
    description: `Non-terminal nullable: {${[...nullable].join(", ") || "-"}}. Setiap produksi ditulis ulang dengan seluruh kombinasi penghapusan simbol nullable, produksi-ε dihapus${startNullable ? " (kecuali pada simbol awal, agar ε tetap dikenali jika memang bagian dari bahasa)" : ""}.`,
    lines: prodsToLines(prods),
  });

  // --- STEP 3: UNIT — eliminasi produksi unit (A -> B) ---
  const isNT = (s) => grammar.nonTerminals.includes(s) || s === start || prods.some((p) => p.lhs === s);
  let unitFound = true;
  let guard = 0;
  while (unitFound && guard < 200) {
    guard++;
    unitFound = false;
    const unitProd = prods.find((p) => p.rhs.length === 1 && isNT(p.rhs[0]));
    if (unitProd) {
      unitFound = true;
      const { lhs, rhs } = unitProd;
      const target = rhs[0];
      const replacements = prods.filter((p) => p.lhs === target && !(p.rhs.length === 1 && isNT(p.rhs[0])));
      const withoutThis = prods.filter((p) => p !== unitProd);
      const added = replacements
        .map((p) => ({ lhs, rhs: [...p.rhs] }))
        .filter((np) => !withoutThis.some((ep) => ep.lhs === np.lhs && ep.rhs.join(" ") === np.rhs.join(" ")));
      prods = [...withoutThis, ...added];
    }
  }
  steps.push({
    title: "3. UNIT — Eliminasi Produksi Unit",
    description: "Setiap produksi berbentuk A → B (B non-terminal tunggal) dihapus dan diganti langsung dengan seluruh produksi milik B.",
    lines: prodsToLines(prods),
  });

  // --- STEP 4: TERM — ganti terminal pada produksi panjang >=2 dengan non-terminal baru ---
  const termMap = new Map();
  prods = prods.map((p) => {
    if (p.rhs.length < 2) return p;
    const newRhs = p.rhs.map((s) => {
      if (grammar.nonTerminals.includes(s) || isNT(s)) return s;
      // it's a terminal
      if (!termMap.has(s)) {
        const nt = freshName("T_", usedNames);
        termMap.set(s, nt);
      }
      return termMap.get(s);
    });
    return { lhs: p.lhs, rhs: newRhs };
  });
  termMap.forEach((nt, terminal) => prods.push({ lhs: nt, rhs: [terminal] }));
  steps.push({
    title: "4. TERM — Isolasi Terminal",
    description: termMap.size
      ? `Terminal pada produksi berukuran ≥2 diganti simbol baru: ${[...termMap.entries()].map(([t, nt]) => `${nt} → ${t}`).join(", ")}.`
      : "Tidak ada produksi campuran terminal/non-terminal berukuran ≥2 yang perlu diubah.",
    lines: prodsToLines(prods),
  });

  // --- STEP 5: BIN — pecah produksi dengan |rhs| > 2 menjadi biner ---
  let binProds = [];
  prods.forEach((p) => {
    if (p.rhs.length <= 2) { binProds.push(p); return; }
    let symbols = [...p.rhs];
    let currentLhs = p.lhs;
    while (symbols.length > 2) {
      const newNt = freshName("X", usedNames);
      binProds.push({ lhs: currentLhs, rhs: [symbols[0], newNt] });
      symbols = symbols.slice(1);
      currentLhs = newNt;
    }
    binProds.push({ lhs: currentLhs, rhs: symbols });
  });
  prods = binProds;
  steps.push({
    title: "5. BIN — Biner-kan Produksi Panjang",
    description: "Produksi dengan ruas kanan lebih dari 2 simbol dipecah menjadi rangkaian produksi biner menggunakan non-terminal bantu.",
    lines: prodsToLines(prods),
  });

  steps.push({
    title: "Hasil Akhir — Chomsky Normal Form",
    description: `Grammar akhir dalam CNF: setiap produksi berbentuk A → BC (dua non-terminal) atau A → a (satu terminal)${startNullable ? `, ditambah ${start} → ε` : ""}.`,
    lines: prodsToLines(prods),
  });

  return { steps, finalProductions: prods, newStart: start };
}
