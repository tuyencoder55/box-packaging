// Component thanh lọc danh mục hộp
import { getCustomTemplates } from '../../importer/customTemplateStore';
import { el } from '../dom';

export interface CategoryOption {
  id: string;
  label: string;
}

export function getCategories(): CategoryOption[] {
  const customCount = getCustomTemplates().length;
  return [
    { id: 'all', label: 'Tất cả mẫu' },
    { id: 'custom', label: `⭐ Mẫu của tôi (${customCount})` },
    { id: 'tuck', label: 'Tuck End Boxes (13 mẫu)' },
    { id: 'carton', label: 'Thùng carton (FEFCO)' },
    { id: 'mailer', label: 'Hộp Mailer' },
    { id: 'other', label: 'Hộp âm dương' },
  ];
}

export const CATEGORIES: CategoryOption[] = getCategories();

export function createFilterBar(
  container: HTMLElement,
  activeId: string,
  onSelect: (id: string) => void,
) {
  container.innerHTML = '';
  container.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px;';

  const categories = getCategories();

  categories.forEach((cat) => {
    const isActive = cat.id === activeId;
    const isCustom = cat.id === 'custom';
    const activeBg = isCustom ? '#059669' : '#0284c7';
    const activeBorder = isCustom ? '#059669' : '#0284c7';
    const activeShadow = isCustom ? '0 2px 6px rgba(5, 150, 105, 0.25)' : '0 2px 4px rgba(2, 132, 199, 0.2)';

    const btn = el('button', {
      class: isActive ? 'filter-btn active' : 'filter-btn',
      text: cat.label,
      style: `
        padding: 9px 18px;
        border-radius: 9999px;
        font-size: 13.5px;
        font-weight: ${isActive ? '600' : '500'};
        cursor: pointer;
        border: 1px solid ${isActive ? activeBorder : isCustom ? '#a7f3d0' : '#e2e8f0'};
        background: ${isActive ? activeBg : isCustom ? '#f0fdf4' : '#ffffff'};
        color: ${isActive ? '#ffffff' : isCustom ? '#047857' : '#475569'};
        transition: all 0.15s ease;
        box-shadow: ${isActive ? activeShadow : 'none'};
      `,
    });

    btn.addEventListener('mouseenter', () => {
      if (!isActive) {
        btn.style.borderColor = isCustom ? '#6ee7b7' : '#cbd5e1';
        btn.style.color = isCustom ? '#065f46' : '#0f172a';
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (!isActive) {
        btn.style.borderColor = isCustom ? '#a7f3d0' : '#e2e8f0';
        btn.style.color = isCustom ? '#047857' : '#475569';
      }
    });

    btn.addEventListener('click', () => {
      onSelect(cat.id);
    });

    container.appendChild(btn);
  });
}
