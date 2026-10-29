// Thanh chuyển 3 bước trên header: Dieline · Mockup 3D · Xuất file
import { el } from '../dom';

export type StepId = 'dieline' | 'mockup' | 'export';

export function createStepBar(
  currentStep: StepId = 'dieline',
  onStepChange?: (step: StepId) => void
): HTMLElement {
  const steps: { id: StepId; label: string }[] = [
    { id: 'dieline', label: '1. Dieline' },
    { id: 'mockup', label: '2. Mockup 3D' },
    { id: 'export', label: '3. Xuất' },
  ];

  const bar = el('nav', {
    className: 'step-bar',
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      background: 'var(--bg-input)',
      padding: '3px 4px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
    },
  });

  for (const s of steps) {
    const isActive = s.id === currentStep;
    const btn = el(
      'button',
      {
        type: 'button',
        className: `step-btn ${isActive ? 'active' : ''}`,
        style: {
          background: isActive ? 'var(--bg-surface)' : 'transparent',
          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          border: 'none',
          padding: '4px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: isActive ? '600' : '400',
        },
        onClick: () => {
          if (onStepChange) onStepChange(s.id);
        },
      },
      s.label
    );
    bar.appendChild(btn);
  }

  return bar;
}
