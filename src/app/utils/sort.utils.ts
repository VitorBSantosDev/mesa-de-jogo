export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((itemA, itemB) => itemA.name.localeCompare(itemB.name, 'pt'));
}
