// Component thanh lọc danh mục hộp
import { el } from '../dom';

export interface CategoryOption {
  id: string;
  label: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'Tất cả mẫu' },
  { id: 'tuck', label: 'Tuck End Boxes (13 mẫu)' },
  { id: 'carton', label: 'Thùng carton (FEFCO)' },
  { id: 'mailer', label: 'Hộp Mailer' },
  { id: 'other', label: 'Hộp âm dương' },
];

export function createFilterBar(
  container: HTMLElement,
  activeId: string,
  onSelect: (id: string) => void,
) {
  container.innerHTML = '';
  container.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px;';

  CATEGORIES.forEach((cat) => {
    const isActive = cat.id === activeId;
    const btn = el('button', {
      class: isActive ? 'filter-btn active' : 'filter-btn',
      text: cat.label,
      style: `
        padding: 9px 18px;
        border-radius: 9999px;
        font-size: 13.5px;
        font-weight: ${isActive ? '600' : '500'};
        cursor: pointer;
        border: 1px solid ${isActive ? '#0284c7' : '#e2e8f0'};
        background: ${isActive ? '#0284c7' : '#ffffff'};
        color: ${isActive ? '#ffffff' : '#475569'};
        transition: all 0.15s ease;
        box-shadow: ${isActive ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none'};
      `,
    });

    btn.addEventListener('mouseenter', () => {
      if (!isActive) {
        btn.style.borderColor = '#cbd5e1';
        btn.style.color = '#0f172a';
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (!isActive) {
        btn.style.borderColor = '#e2e8f0';
        btn.style.color = '#475569';
      }
    });

    btn.addEventListener('click', () => {
      onSelect(cat.id);
    });

    container.appendChild(btn);
  });
}
