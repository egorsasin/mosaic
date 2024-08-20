/**
 * An in-memory cache with a configurable TTL (time to live) which means cache items
 * expire after they have been in the cache longer than that time.
 *
 * The `ttl` config option is in milliseconds. Defaults to 30 seconds TTL and a cache size of 1000.
 */
export class TtlCache<K, V> {
  private cache = new Map<K, { value: V; expires: number }>();
  private readonly ttl: number = 30 * 1000;
  private readonly cacheSize: number = 1000;

  constructor(config?: { ttl?: number; cacheSize?: number }) {
    if (config?.ttl) {
      this.ttl = config.ttl;
    }
    if (config?.cacheSize) {
      this.cacheSize = config.cacheSize;
    }
  }

  public get(key: K): V | undefined {
    const hit = this.cache.get(key);
    const now = new Date().getTime();

    if (hit) {
      if (now < hit.expires) {
        return hit.value;
      } else {
        this.cache.delete(key);
      }
    }
  }

  public set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size === this.cacheSize) {
      this.cache.delete(this.first());
    }

    this.cache.set(key, {
      value,
      expires: new Date().getTime() + this.ttl,
    });
  }

  public delete(key: K): void {
    this.cache.delete(key);
  }

  private first(): K {
    return this.cache.keys().next().value;
  }
}
