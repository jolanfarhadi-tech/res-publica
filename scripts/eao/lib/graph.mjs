// Shared EAO utility - generic directed-graph algorithms, reused by any
// pipeline needing dependency analysis (not specific to Markdown or git).
// Read-only / pure functions: no I/O.

// adjacency: Map<nodeId, Set<nodeId>> (forward edges)
// Returns an array of cycles, each an array of node ids (first === last).
export function findCycles(adjacency) {
  const visited = new Set();
  const stack = new Set();
  const path = [];
  const cycles = [];

  function dfs(node) {
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const next of adjacency.get(node) || []) {
      if (!visited.has(next)) {
        dfs(next);
      } else if (stack.has(next)) {
        const cycleStart = path.indexOf(next);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), next]);
        }
      }
    }
    stack.delete(node);
    path.pop();
  }

  for (const node of adjacency.keys()) {
    if (!visited.has(node)) dfs(node);
  }
  return cycles;
}

export function buildReverse(adjacency) {
  const reverse = new Map();
  for (const [from, targets] of adjacency.entries()) {
    for (const to of targets) {
      if (!reverse.has(to)) reverse.set(to, new Set());
      reverse.get(to).add(from);
    }
  }
  return reverse;
}
