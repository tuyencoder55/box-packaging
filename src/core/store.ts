// Kho trạng thái nhỏ gọn: get / set / subscribe theo slice (tránh vẽ lại toàn bộ)

export type Selector<T, R> = (state: T) => R;
export type Listener<R> = (val: R, prev: R) => void;
export type Unsubscribe = () => void;

export interface Store<T extends object> {
  get(): T;
  set(patch: Partial<T> | ((prev: T) => Partial<T>)): void;
  subscribe<R>(
    selector: Selector<T, R>,
    listener: Listener<R>,
    isEqual?: (a: R, b: R) => boolean
  ): Unsubscribe;
}

/**
 * Tạo một store trạng thái mới
 */
export function createStore<T extends object>(initialState: T): Store<T> {
  let state = { ...initialState };

  type SubEntry<R> = {
    selector: Selector<T, R>;
    listener: Listener<R>;
    currentValue: R;
    isEqual: (a: R, b: R) => boolean;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subs = new Set<SubEntry<any>>();

  return {
    get() {
      return state;
    },

    set(patch) {
      const prevState = state;
      const nextPatch = typeof patch === 'function' ? patch(prevState) : patch;
      state = { ...prevState, ...nextPatch };

      for (const sub of subs) {
        const nextVal = sub.selector(state);
        if (!sub.isEqual(nextVal, sub.currentValue)) {
          const prevVal = sub.currentValue;
          sub.currentValue = nextVal;
          sub.listener(nextVal, prevVal);
        }
      }
    },

    subscribe<R>(
      selector: Selector<T, R>,
      listener: Listener<R>,
      isEqual: (a: R, b: R) => boolean = (a, b) => Object.is(a, b)
    ): Unsubscribe {
      const entry: SubEntry<R> = {
        selector,
        listener,
        currentValue: selector(state),
        isEqual,
      };

      subs.add(entry);
      return () => {
        subs.delete(entry);
      };
    },
  };
}

