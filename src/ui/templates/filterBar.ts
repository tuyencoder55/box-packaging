// Component thanh lọc danh mục hộp
import { el } from '../dom';

export interface CategoryOption {
  id: string;
  label: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'carton', label: 'Thùng carton' },
  { id: 'tuck', label: 'Hộp nắp gài' },
  { id: 'auto-lock', label: 'Đáy khoá' },
  { id: 'mailer', label: 'Hộp Mailer' },
];

export function createFilterBar(
  container: HTMLElement,
  activeId: string,
  onSelect: (id: string) => void,
) {
  container.innerHTML = '';
  container.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;';

  CATEGORIES.forEach((cat) => {
    const isActive = cat.id === activeId;
    const btn = el('button', {
      class: isActive ? 'filter-btn active' : 'filter-btn',
      text: cat.label,
      style: `
        padding: 8px 16px;
        border-radius: var(--radius-full);
        font-size: var(--font-size-sm);
        font-weight: 500;
        cursor: pointer;
        border: 1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-subtle)'};
        background: ${isActive ? 'var(--color-primary)' : 'var(--bg-surface)'};
        color: ${isActive ? 'var(--color-primary-fg)' : 'var(--text-secondary)'};
        transition: all 0.15s ease;
      `,
    });

    btn.addEventListener('click', () => {
      onSelect(cat.id);
    });

    container.appendChild(btn);
  });
}
