"use client";

// node: { symbol, children: [{terminal:true, symbol} | node] }
function layout(node, depth, xRef, positions) {
  const isLeaf = !node.children || node.children.length === 0;
  if (isLeaf) {
    const x = xRef.current;
    xRef.current += 60;
    positions.set(node, { x, y: depth * 70, depth });
    return;
  }
  node.children.forEach((c) => layout(c, depth + 1, xRef, positions));
  const childPositions = node.children.map((c) => positions.get(c));
  const minX = Math.min(...childPositions.map((p) => p.x));
  const maxX = Math.max(...childPositions.map((p) => p.x));
  positions.set(node, { x: (minX + maxX) / 2, y: depth * 70, depth });
}

export default function TreeDiagram({ tree }) {
  if (!tree) return null;
  const xRef = { current: 30 };
  const positions = new Map();
  layout(tree, 0, xRef, positions);
  const width = Math.max(xRef.current + 30, 200);
  const maxDepth = Math.max(...[...positions.values()].map((p) => p.depth));
  const height = (maxDepth + 1) * 70 + 40;

  const edges = [];
  const collectEdges = (node) => {
    (node.children || []).forEach((c) => {
      edges.push({ from: positions.get(node), to: positions.get(c) });
      collectEdges(c);
    });
  };
  collectEdges(tree);

  const allNodes = [];
  const collectNodes = (node) => {
    allNodes.push({ node, pos: positions.get(node), leaf: !node.children || node.children.length === 0 });
    (node.children || []).forEach(collectNodes);
  };
  collectNodes(tree);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto w-full max-w-3xl">
      <style>{`
        .tnode-nt { fill: #1e293b; stroke: #6366f1; stroke-width: 2; }
        .tnode-t { fill: #064e3b; stroke: #34d399; stroke-width: 2; }
        .tlabel { fill: #e2e8f0; font-size: 13px; font-family: monospace; text-anchor: middle; dominant-baseline: middle; }
        .tedge { stroke: #475569; stroke-width: 1.5; }
      `}</style>
      {edges.map((e, i) => (
        <line key={i} className="tedge" x1={e.from.x} y1={e.from.y + 16} x2={e.to.x} y2={e.to.y + 16} />
      ))}
      {allNodes.map((n, i) => (
        <g key={i} transform={`translate(${n.pos.x}, ${n.pos.y + 16})`}>
          {n.leaf ? (
            <rect className="tnode-t" x={-16} y={-14} width={32} height={28} rx={4} />
          ) : (
            <circle className="tnode-nt" r={18} />
          )}
          <text className="tlabel" x={0} y={1}>{n.node.symbol}</text>
        </g>
      ))}
    </svg>
  );
}
