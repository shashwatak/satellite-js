export function topologicalSort<
  const T extends string
>(items: { provides: T, hasDependencies: readonly T[] }[]): T[] {
  const visited = new Set<T>();

  let someRemoved = true;
  while (someRemoved) {
    someRemoved = false;
    for (const { provides, hasDependencies } of items) {
      if (hasDependencies.every((dep) => visited.has(dep)) && !visited.has(provides)) {
        visited.add(provides);
        someRemoved = true;
      }
    }
  }

  if (visited.size !== items.length) {
    throw new Error('Cyclic dependency detected');
  }

  return Array.from(visited);
}
