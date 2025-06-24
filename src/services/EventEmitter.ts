/**
 * A strongly-typed, zero-dependency event bus.
 *
 * @template E  Union of all events `{ type: string; data: … }`.
 *
 * Usage:
 * ```ts
 * const emitter = new EventEmitter<GameEvent>();
 *
 * // subscribe
 * const off = emitter.on('gameEnd', payload => console.log(payload.message));
 *
 * // emit
 * emitter.emit({ type: 'gameEnd', data: { message: 'GG' } });
 *
 * // unsubscribe
 * off();
 * ```
 */
export class EventEmitter<E extends { type: string; data: any }> {
  /* ------------------------------------------------------------------ */
  /*                                FIELDS                              */
  /* ------------------------------------------------------------------ */

  /** Map event-type → Set of listeners */
  private readonly listeners = new Map<
    E['type'],
    Set<(data: E['data']) => void>
  >();

  /* ------------------------------------------------------------------ */
  /*                               PUBLIC                               */
  /* ------------------------------------------------------------------ */

  /**
   * Subscribe to an event type.
   *
   * @param type Event discriminator (`"boardUpdate"` …).
   * @param cb   Listener callback.
   * @returns    A small `off()` helper to remove the listener.
   */
  public on<K extends E['type']>(
    type: K,
    cb: (data: Extract<E, { type: K }>['data']) => void
  ): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(cb as any);

    // return unsubscribe helper
    return () => this.off(type, cb);
  }

  /**
   * Subscribe once: the listener is auto-removed after the first fire.
   */
  public once<K extends E['type']>(
    type: K,
    cb: (data: Extract<E, { type: K }>['data']) => void
  ): () => void {
    const off = this.on(type, (payload) => {
      off();
      cb(payload);
    });
    return off;
  }

  /**
   * Unsubscribe a callback for a given event.
   */
  public off<K extends E['type']>(
    type: K,
    cb: (data: Extract<E, { type: K }>['data']) => void
  ): void {
    this.listeners.get(type)?.delete(cb as any);
  }

  /**
   * Emit an event (synchronously).  
   * Wraps listener calls in `queueMicrotask` to avoid UI jank.
   */
  public emit<T extends E>(event: T): void {
    const set = this.listeners.get(event.type);
    if (!set || set.size === 0) return;

    // clone to avoid mutation side-effects during iteration
    const cbs = Array.from(set);
    for (const cb of cbs) {
      queueMicrotask(() => {
        try {
          (cb as (data: T['data']) => void)(event.data);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Error in "${event.type}" listener:`, err);
        }
      });
    }
  }

  /** Remove **all** listeners for all event types. */
  public clear(): void {
    this.listeners.clear();
  }
}