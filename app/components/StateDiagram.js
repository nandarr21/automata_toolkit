"use client";

// Generic circular-layout state diagram. Accepts {states, start, accept, transitions}
// transitions: [{from, symbol, to}]
export default function StateDiagram({ states, start, accept = [], transitions = [], activeStates = [] }) {
  const n = states.length;
  if (n === 0) return null;
  const size = Math.max(360, n * 90);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 70;
  const nodeR = 26;

  const pos = {};
  states.forEach((s, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    pos[s] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  // group transitions by (from,to) pair to combine symbol labels
  const grouped = new Map();
  transitions.forEach((t) => {
    const key = `${t.from}=>${t.to}`;
    if (!grouped.has(key)) grouped.set(key, { from: t.from, to: t.to, symbols: [] });
    grouped.get(key).symbols.push(t.symbol);
  });

  const edges = [...grouped.values()];

  return (
    <svg viewBox={`0 0 ${size} ${size + 40}`} className="w-full max-w-2xl mx-auto">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="var(--edge, #64748b)" />
        </marker>
      </defs>
      <style>{`
        .node { fill: #1e293b; stroke: #64748b; stroke-width: 2; }
        .node.accept { stroke: #34d399; stroke-width: 3; }
        .node.active { fill: #065f46; stroke: #34d399; }
        .label { fill: #e2e8f0; font-size: 13px; font-family: monospace; text-anchor: middle; dominant-baseline: middle; }
        .edge { stroke: #64748b; stroke-width: 1.5; fill: none; marker-end: url(#arrow); }
        .edge-label { fill: #a5b4fc; font-size: 12px; font-family: monospace; text-anchor: middle; }
        .start-arrow { stroke: #fbbf24; stroke-width: 2; marker-end: url(#arrow); }
      `}</style>

      {/* start arrow */}
      {pos[start] && (
        <line
          className="start-arrow"
          x1={pos[start].x - 60}
          y1={pos[start].y}
          x2={pos[start].x - nodeR - 4}
          y2={pos[start].y}
        />
      )}

      {/* edges */}
      {edges.map((e, i) => {
        const p1 = pos[e.from];
        const p2 = pos[e.to];
        if (!p1 || !p2) return null;
        const label = e.symbols.join(", ");
        if (e.from === e.to) {
          // self loop
          const loopX = p1.x;
          const loopY = p1.y - nodeR - 30;
          return (
            <g key={i}>
              <path
                className="edge"
                d={`M ${p1.x - 12} ${p1.y - nodeR + 4} C ${p1.x - 30} ${loopY}, ${p1.x + 30} ${loopY}, ${p1.x + 12} ${p1.y - nodeR + 4}`}
              />
              <text className="edge-label" x={loopX} y={loopY - 4}>{label}</text>
            </g>
          );
        }
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const ux = dx / dist;
        const uy = dy / dist;
        const x1 = p1.x + ux * nodeR;
        const y1 = p1.y + uy * nodeR;
        const x2 = p2.x - ux * nodeR;
        const y2 = p2.y - uy * nodeR;
        const mx = (x1 + x2) / 2 - uy * 14;
        const my = (y1 + y2) / 2 + ux * 14;
        return (
          <g key={i}>
            <path className="edge" d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} />
            <text className="edge-label" x={mx} y={my - 4}>{label}</text>
          </g>
        );
      })}

      {/* nodes */}
      {states.map((s) => {
        const p = pos[s];
        const isAccept = accept.includes(s);
        const isActive = activeStates.includes(s);
        return (
          <g key={s}>
            <circle className={`node ${isAccept ? "accept" : ""} ${isActive ? "active" : ""}`} cx={p.x} cy={p.y} r={nodeR} />
            {isAccept && <circle cx={p.x} cy={p.y} r={nodeR - 5} fill="none" stroke="#34d399" strokeWidth="1.5" />}
            <text className="label" x={p.x} y={p.y}>{s}</text>
          </g>
        );
      })}
    </svg>
  );
}
