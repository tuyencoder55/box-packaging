// Panel tham số bên trái: giao diện thẻ (card) bo góc hiện đại, sinh tự động từ BoxDef
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

function createCard(titleText?: string): HTMLElement {
  const card = el('div', {
    style: `
      background: #20242e;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `,
  });

  if (titleText) {
    const heading = el('div', {
      text: titleText,
      style: `
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--text-muted);
        margin-bottom: 2px;
      `,
    });
    card.appendChild(heading);
  }

  return card;
}

const inputStyle = `
  background: #16181f;
  color: var(--text-main);
  border: 1px solid #2e3442;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: var(--font-size-sm);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
`;

export function initParamPanel(
  container: HTMLElement,
  store: Store<AppDocState>,
  boxDef: BoxDef
): void {
  container.innerHTML = '';
  container.style.cssText = `
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
    background-color: #181b22;
    border-right: 1px solid rgba(255, 255, 255, 0.07);
    overflow-y: auto;
  `;

  const state = store.get();

  // Header Panel
  const panelHeader = el('div', {
    style: 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;',
  });
  const mainTitle = el('div', {
    text: 'THÔNG SỐ THIẾT KẾ',
    style: 'font-size: 12px; font-weight: 800; letter-spacing: 0.8px; color: var(--text-main); display: flex; align-items: center; gap: 6px;',
  });
  panelHeader.appendChild(mainTitle);
  container.appendChild(panelHeader);

  // Thông báo lỗi
  const errorMsg = el('div', {
    style: `
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: var(--font-size-xs);
      display: none;
    `,
  });
  container.appendChild(errorMsg);

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

  // CARD 1: Quy cách đo & Đơn vị
  const cardMeasure = createCard('Quy cách & Đơn vị');

  // Segmented control: Lòng vs Phủ bì
  const sizeTypeWrap = el('div', {
    style: `
      display: flex;
      background: #16181f;
      border: 1px solid #2e3442;
      border-radius: 8px;
      padding: 3px;
      gap: 4px;
    `,
  });

  const btnInner = el('button', {
    text: 'Kích thước lòng',
    style: `
      flex: 1;
      padding: 6px 8px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: ${state.sizeType === 'inner' ? 'var(--color-primary)' : 'transparent'};
      color: ${state.sizeType === 'inner' ? 'var(--color-primary-fg)' : 'var(--text-muted)'};
      transition: all 0.15s ease;
    `,
  });

  const btnOuter = el('button', {
    text: 'Phủ bì',
    style: `
      flex: 1;
      padding: 6px 8px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      background: ${state.sizeType === 'outer' ? 'var(--color-primary)' : 'transparent'};
      color: ${state.sizeType === 'outer' ? 'var(--color-primary-fg)' : 'var(--text-muted)'};
      transition: all 0.15s ease;
    `,
  });

  btnInner.addEventListener('click', () => {
    store.set({ sizeType: 'inner' });
    btnInner.style.background = 'var(--color-primary)';
    btnInner.style.color = 'var(--color-primary-fg)';
    btnOuter.style.background = 'transparent';
    btnOuter.style.color = 'var(--text-muted)';
  });

  btnOuter.addEventListener('click', () => {
    store.set({ sizeType: 'outer' });
    btnOuter.style.background = 'var(--color-primary)';
    btnOuter.style.color = 'var(--color-primary-fg)';
    btnInner.style.background = 'transparent';
    btnInner.style.color = 'var(--text-muted)';
  });

  sizeTypeWrap.appendChild(btnInner);
  sizeTypeWrap.appendChild(btnOuter);
  cardMeasure.appendChild(sizeTypeWrap);

  // Chọn đơn vị
  const unitSelect = el(
    'select',
    {
      style: inputStyle,
      onChange: (e: Event) => {
        const newUnit = (e.target as HTMLSelectElement).value as Unit;
        store.set({ unit: newUnit });
      },
    },
    el('option', { value: 'mm', selected: state.unit === 'mm' }, 'Milimét (mm)'),
    el('option', { value: 'cm', selected: state.unit === 'cm' }, 'Xentimét (cm)'),
    el('option', { value: 'inch', selected: state.unit === 'inch' }, 'Inch (in)')
  );
  unitSelect.addEventListener('focus', () => (unitSelect.style.borderColor = 'var(--color-primary)'));
  unitSelect.addEventListener('blur', () => (unitSelect.style.borderColor = '#2e3442'));
  cardMeasure.appendChild(unitSelect);

  container.appendChild(cardMeasure);

  // CARD 2: Kích thước 3 chiều L x W x H
  const cardDims = createCard('Kích thước hộp (Dài × Rộng × Cao)');

  function createDimField(label: string, symbol: string, param: 'l' | 'w' | 'h') {
    const wrap = el('div', { style: 'display: flex; flex-direction: column; gap: 5px;' });

    const lblRow = el('div', {
      style: 'display: flex; justify-content: space-between; align-items: center;',
    });
    const lbl = el('span', { text: label, style: 'font-size: 12px; font-weight: 500; color: var(--text-muted);' });
    const badge = el('span', {
      text: symbol,
      style: 'font-size: 10px; font-weight: 700; color: var(--color-primary); background: rgba(0, 210, 135, 0.1); padding: 1px 6px; border-radius: 4px;',
    });
    lblRow.appendChild(lbl);
    lblRow.appendChild(badge);

    const inputWrap = el('div', { style: 'position: relative; display: flex; align-items: center;' });
    const input = el('input', {
      type: 'number',
      step: 'any',
      value: mmToUnit(store.get()[param], store.get().unit),
      style: `${inputStyle} padding-right: 36px;`,
      onInput: (e: Event) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        validateAndSet(param, val, store.get().unit);
      },
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = 'var(--color-primary)';
      input.style.boxShadow = '0 0 0 2px rgba(0, 210, 135, 0.15)';
    });
    input.addEventListener('blur', () => {
      input.style.borderColor = '#2e3442';
      input.style.boxShadow = 'none';
    });

    const unitSuffix = el('span', {
      text: store.get().unit,
      style: 'position: absolute; right: 10px; font-size: 11px; color: var(--text-dim); pointer-events: none;',
    });

    store.subscribe(
      (s) => ({ val: s[param], unit: s.unit }),
      ({ val, unit }) => {
        const displayVal = Number(mmToUnit(val, unit).toFixed(2));
        if (parseFloat(input.value) !== displayVal) {
          input.value = String(displayVal);
        }
        unitSuffix.textContent = unit;
      }
    );

    inputWrap.appendChild(input);
    inputWrap.appendChild(unitSuffix);
    wrap.appendChild(lblRow);
    wrap.appendChild(inputWrap);
    return wrap;
  }

  cardDims.appendChild(createDimField('Chiều dài', 'L', 'l'));
  cardDims.appendChild(createDimField('Chiều rộng', 'W', 'w'));
  cardDims.appendChild(createDimField('Chiều cao', 'H', 'h'));
  container.appendChild(cardDims);

  // CARD 3: Độ dày giấy & Bù trừ
  const cardMaterial = createCard('Vật liệu & Độ dày');

  const thickWrap = el('div', { style: 'display: flex; flex-direction: column; gap: 5px;' });
  const thickLabel = el('span', { text: 'Độ dày giấy (t)', style: 'font-size: 12px; color: var(--text-muted);' });

  const thickInputWrap = el('div', { style: 'position: relative; display: flex; align-items: center;' });
  const inputThickness = el('input', {
    type: 'number',
    step: '0.1',
    value: state.t,
    style: `${inputStyle} padding-right: 36px;`,
    onInput: (e: Event) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      if (!isNaN(val) && val >= 0) {
        store.set({ t: val });
      }
    },
  });
  thickInputWrap.appendChild(inputThickness);
  thickInputWrap.appendChild(
    el('span', { text: 'mm', style: 'position: absolute; right: 10px; font-size: 11px; color: var(--text-dim);' })
  );
  thickWrap.appendChild(thickLabel);
  thickWrap.appendChild(thickInputWrap);
  cardMaterial.appendChild(thickWrap);

  // Công tắc bù độ dày giấy
  const compRow = el('label', {
    style: 'display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 2px;',
  });
  const chkComp = document.createElement('input');
  chkComp.type = 'checkbox';
  chkComp.checked = state.compensate;
  chkComp.style.cssText = 'accent-color: var(--color-primary); cursor: pointer; width: 16px; height: 16px;';
  chkComp.addEventListener('change', () => {
    store.set({ compensate: chkComp.checked });
  });

  const compText = el('span', {
    text: 'Tự động bù độ dày giấy',
    style: 'font-size: 12px; font-weight: 500; color: var(--text-main);',
  });
  compRow.appendChild(chkComp);
  compRow.appendChild(compText);
  cardMaterial.appendChild(compRow);

  container.appendChild(cardMaterial);

  // CARD 4: Hướng hiển thị khuôn
  const cardOrient = createCard('Hướng hiển thị khuôn');
  const orientSelect = el(
    'select',
    {
      style: inputStyle,
      onChange: (e: Event) => {
        const val = (e.target as HTMLSelectElement).value as Orient;
        store.set({ orient: val });
      },
    },
    el('option', { value: 'normal', selected: state.orient === 'normal' }, 'Chuẩn (Mặc định)'),
    el('option', { value: 'flipH', selected: state.orient === 'flipH' }, 'Lật ngang'),
    el('option', { value: 'flipV', selected: state.orient === 'flipV' }, 'Lật dọc'),
    el('option', { value: 'rot180', selected: state.orient === 'rot180' }, 'Xoay 180°')
  );
  cardOrient.appendChild(orientSelect);
  container.appendChild(cardOrient);

  // CARD 5: Tùy chọn riêng nếu có
  if (boxDef.options && boxDef.options.length > 0) {
    const cardOpts = createCard('Tùy chọn cấu trúc');
    for (const opt of boxDef.options) {
      if (opt.type === 'number') {
        const optWrap = el('div', { style: 'display: flex; flex-direction: column; gap: 5px;' });
        const optLbl = el('span', { text: opt.label, style: 'font-size: 12px; color: var(--text-muted);' });
        const optInp = el('input', {
          type: 'number',
          value: Number(state.opts[opt.key] ?? opt.default),
          min: opt.min,
          max: opt.max,
          style: inputStyle,
          onInput: (e: Event) => {
            const val = parseFloat((e.target as HTMLInputElement).value);
            if (!isNaN(val)) {
              store.set((prev) => ({
                opts: { ...prev.opts, [opt.key]: val },
              }));
            }
          },
        });
        optWrap.appendChild(optLbl);
        optWrap.appendChild(optInp);
        cardOpts.appendChild(optWrap);
      }
    }
    container.appendChild(cardOpts);
  }
}
