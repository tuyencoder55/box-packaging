// Bảng chú giải dao dứt, dao cấn và đường kích thước khuôn
import { el } from '../dom';

export function createLegend(): HTMLElement {
  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--text-muted)',
  };

  const lineBase = 'display: inline-block; width: 24px; height: 0;';

  return el(
    'div',
    {
      className: 'dieline-legend',
      style: {
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(38, 42, 52, 0.85)',
        backdropFilter: 'blur(4px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        display: 'flex',
        gap: '16px',
        pointerEvents: 'none',
      },
    },
    el('div', { style: itemStyle },
      el('span', { style: `${lineBase} border-top: 2px solid #3b82f6;` }),
      'Dao dứt (Cắt)'
    ),
    el('div', { style: itemStyle },
      el('span', { style: `${lineBase} border-top: 2px dashed #ef4444;` }),
      'Dao cấn (Gấp)'
    ),
    el('div', { style: itemStyle },
      el('span', { style: `${lineBase} border-top: 1px solid #9da5b4;` }),
      'Kích thước'
    )
  );
}
