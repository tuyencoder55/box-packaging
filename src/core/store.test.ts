// Kiểm thử kho trạng thái src/core/store.ts
import { describe, expect, it, vi } from 'vitest';
import { createStore } from './store';

describe('store', () => {
  it('khởi tạo và lấy trạng thái ban đầu bằng get()', () => {
    const store = createStore({ count: 1, name: 'box' });
    expect(store.get()).toEqual({ count: 1, name: 'box' });
  });

  it('cập nhật trạng thái bằng đối tượng patch', () => {
    const store = createStore({ count: 1, name: 'box' });
    store.set({ count: 2 });
    expect(store.get()).toEqual({ count: 2, name: 'box' });
  });

  it('cập nhật trạng thái bằng hàm patch', () => {
    const store = createStore({ count: 1, name: 'box' });
    store.set((prev) => ({ count: prev.count + 5 }));
    expect(store.get().count).toBe(6);
  });

  it('chỉ kích hoạt subscriber khi slice được chọn thay đổi', () => {
    const store = createStore({ l: 100, w: 200, unit: 'mm' });
    const listenerL = vi.fn();
    const listenerUnit = vi.fn();

    store.subscribe((s) => s.l, listenerL);
    store.subscribe((s) => s.unit, listenerUnit);

    // Cập nhật w, l và unit không đổi
    store.set({ w: 250 });
    expect(listenerL).not.toHaveBeenCalled();
    expect(listenerUnit).not.toHaveBeenCalled();

    // Cập nhật l -> chỉ listenerL được gọi
    store.set({ l: 120 });
    expect(listenerL).toHaveBeenCalledTimes(1);
    expect(listenerL).toHaveBeenCalledWith(120, 100);
    expect(listenerUnit).not.toHaveBeenCalled();
  });

  it('cho phép hủy đăng ký theo dõi (unsubscribe)', () => {
    const store = createStore({ active: false });
    const listener = vi.fn();
    const unsub = store.subscribe((s) => s.active, listener);

    store.set({ active: true });
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    store.set({ active: false });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

