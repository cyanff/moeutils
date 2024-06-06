export interface LRUCache {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
}

export function createLRU(capacity: number): LRUCache {
  let map = new Map<string, string>();

  function get(key: string): string | undefined {
    if (!map.has(key)) {
      return undefined;
    }
    const value = map.get(key)!;
    // Refresh the key by deleting and setting it again
    map.delete(key);
    map.set(key, value);
    return value;
  }

  function set(key: string, value: string): void {
    if (map.has(key)) {
      map.delete(key);
    } else if (map.size >= capacity) {
      // Evict the least recently used item
      const firstKey = map.keys().next().value;
      map.delete(firstKey);
    }
    map.set(key, value);
  }

  return { get, set };
}
