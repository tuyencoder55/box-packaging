// Panel tham số bên trái: sinh tự động từ BoxDef, bắt lỗi nhập liệu và cập nhật Store
import type { BoxDef } from '../../core/types';
import type { Store } from '../../core/store';
import type { Orient } from '../../core/orient';
import { mmToUnit, unitToMm, type Unit } from '../../core/units';
import { el } from '../dom';

export interface AppDocState {
  boxId: string;
  unit: Unit;
  sizeType: 'inner' | 'outer';
  l: number; // mm (kích thước lòng nội bộ)
  w: number; // mm
  h: number; // mm
  t: number; // mm
  compensate: boolean;
  opts: Record<string, string | boolean | number>;
  orient: 'normal' | 'flipH' | 'flipV' | 'rot180';
}

export function initParamPanel(
  container: HTMLElement,
  store: Store<AppDocState>,
  boxDef: BoxDef
): void {
  container.innerHTML = '';
  container.style.cssText =
    'display: flex; flex-direction: column; gap: 14px; padding: 16px; background-color: var(--bg-surface); border-right: 1px solid var(--border-subtle); overflow-y: auto;';

  const state = store.get();

  // 1. Nhóm chọn đơn vị
  const unitSelect = el(
    'select',
    {
      style: {
        background: 'var(--bg-input)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
      },
      onChange: (e: Event) => {
        const newUnit = (e.target as HTMLSelectElement).value as Unit;
        store.set({ unit: newUnit });
      },
    },
    el('option', { value: 'mm', selected: state.unit === 'mm' }, 'Milimét (mm)'),
    el('option', { value: 'cm', selected: state.unit === 'cm' }, 'Xentimét (cm)'),
    el('option', { value: 'inch', selected: state.unit === 'inch' }, 'Inch (in)')
  );

  // 2. Nhóm chọn Lòng / Phủ bì
  const sizeTypeSelect = el(
    'select',
    {
      style: {
        background: 'var(--bg-input)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
      },
      onChange: (e: Event) => {
        const newType = (e.target as HTMLSelectElement).value as 'inner' | 'outer';
        store.set({ sizeType: newType });
      },
    },
    el('option', { value: 'inner', selected: state.sizeType === 'inner' }, 'Kích thước lòng'),
    el('option', { value: 'outer', selected: state.sizeType === 'outer' }, 'Kích thước phủ bì')
  );

  // Thông báo lỗi
  const errorMsg = el('div', {
    style: { color: 'var(--color-crease)', fontSize: 'var(--font-size-xs)', display: 'none' },
  });

  function validateAndSet(param: 'l' | 'w' | 'h', rawVal: number, currUnit: Unit) {
    if (isNaN(rawVal) || rawVal <= 0) {
      errorMsg.textContent = 'Kích thước phải là số dương lớn hơn 0';
      errorMsg.style.display = 'block';
      return;
    }
    errorMsg.style.display = 'none';
    const mmVal = unitToMm(rawVal, currUnit);
    store.set({ [param]: mmVal });
  }

  // 3. Ô nhập Dài / Rộng / Cao
  function createDimInput(label: string, param: 'l' | 'w' | 'h') {
    const input = el('input', {
      type: 'number',
      step: 'any',
      value: mmToUnit(store.get()[param], store.get().unit),
      style: {
        background: 'var(--bg-input)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
        width: '100%',
      },
      onInput: (e: Event) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        validateAndSet(param, val, store.get().unit);
      },
    });

    store.subscribe(
      (s) => ({ val: s[param], unit: s.unit }),
      ({ val, unit }) => {
        const displayVal = Number(mmToUnit(val, unit).toFixed(2));
        if (parseFloat(input.value) !== displayVal) {
          input.value = String(displayVal);
        }
      }
    );

    return el('label', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
      el('span', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, label),
      input
    );
  }

  // 4. Độ dày giấy
  const inputThickness = el('input', {
    type: 'number',
    step: '0.1',
    value: state.t,
    style: {
      background: 'var(--bg-input)',
      color: 'var(--text-main)',
      border: '1px solid var(--border-subtle)',
      padding: '6px 10px',
      borderRadius: 'var(--radius-sm)',
      width: '100%',
    },
    onInput: (e: Event) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(val) && val >= 0) {
        store.set({ t: val });
      }
    },
  });

  // 5. Options riêng của từng hộp
  const optElements: HTMLElement[] = [];
  for (const opt of boxDef.options) {
    if (opt.type === 'number') {
      const optInput = el('input', {
        type: 'number',
        value: Number(state.opts[opt.key] ?? opt.default),
        min: opt.min,
        max: opt.max,
        style: {
          background: 'var(--bg-input)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          width: '100%',
        },
        onInput: (e: Event) => {
          const val = parseFloat((e.target as HTMLInputElement).value);
          if (!isNaN(val)) {
            store.set((prev) => ({
              opts: { ...prev.opts, [opt.key]: val },
            }));
          }
        },
      });

      optElements.push(
        el('label', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
          el('span', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, opt.label),
          optInput
        )
      );
    }
  }

  // 6. Hướng hiển thị
  const orientSelect = el(
    'select',
    {
      style: {
        background: 'var(--bg-input)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-subtle)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
      },
      onChange: (e: Event) => {
        const val = (e.target as HTMLSelectElement).value as Orient;
        store.set({ orient: val });
      },
    },
    el('option', { value: 'normal', selected: state.orient === 'normal' }, 'Chuẩn'),
    el('option', { value: 'flipH', selected: state.orient === 'flipH' }, 'Lật ngang'),
    el('option', { value: 'flipV', selected: state.orient === 'flipV' }, 'Lật dọc'),
    el('option', { value: 'rot180', selected: state.orient === 'rot180' }, 'Xoay 180°')
  );

  // Lắp ráp toàn bộ panel
  container.append(
    el('h3', { style: { fontSize: 'var(--font-size-base)', margin: '0 0 4px 0' } }, 'Thông số kích thước'),
    errorMsg,
    el('label', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
      el('span', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, 'Đơn vị hiển thị'),
      unitSelect
    ),
    el('label', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
      el('span', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, 'Kiểu kích thước'),
      sizeTypeSelect
    ),
    createDimInput('Chiều dài (L)', 'l'),
    createDimInput('Chiều rộng (W)', 'w'),
    createDimInput('Chiều cao (H)', 'h'),
    el('label', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
      el('span', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, 'Độ dày giấy (mm)'),
      inputThickness
    ),
    el('label', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
      el('span', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' } }, 'Hướng hiển thị'),
      orientSelect
    ),
    ...optElements
  );
}
