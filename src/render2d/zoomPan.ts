// Điều khiển phóng to/thu nhỏ (zoom), kéo dời (pan) và thanh điều khiển % zoom
import { el } from '../ui/dom';

export interface ZoomPanController {
  reset(): void;
  zoomIn(): void;
  zoomOut(): void;
  getZoom(): number;
}

export function setupZoomPan(
  container: HTMLElement,
  svg: SVGSVGElement
): ZoomPanController {
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // Thanh điều khiển Zoom nổi
  let controlBar = container.querySelector<HTMLElement>('.zoom-controls');
  if (!controlBar) {
    controlBar = el('div', {
      className: 'zoom-controls',
      style: {
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(38, 42, 52, 0.9)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '4px 8px',
        fontSize: 'var(--font-size-xs)',
        zIndex: '10',
      },
    });
    container.appendChild(controlBar);
  }

  const zoomLabel = el('span', { style: { minWidth: '42px', textAlign: 'center', color: 'var(--text-main)' } }, '100%');

  const btnMinus = el('button', {
    type: 'button',
    style: { background: 'transparent', color: 'var(--text-main)', padding: '2px 6px' },
    onClick: () => zoomOut(),
  }, '−');

  const btnPlus = el('button', {
    type: 'button',
    style: { background: 'transparent', color: 'var(--text-main)', padding: '2px 6px' },
    onClick: () => zoomIn(),
  }, '+');

  const btnReset = el('button', {
    type: 'button',
    title: 'Vừa khung',
    style: { background: 'transparent', color: 'var(--text-muted)', padding: '2px 6px' },
    onClick: () => reset(),
  }, '⛶');

  controlBar.innerHTML = '';
  controlBar.append(btnMinus, zoomLabel, btnPlus, btnReset);

  function applyTransform() {
    const content = svg.querySelector<SVGGElement>('.viewport-content');
    if (content) {
      content.style.transformOrigin = 'center';
      content.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    }
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  function setZoom(nextZoom: number) {
    zoom = Math.min(5, Math.max(0.2, nextZoom));
    applyTransform();
  }

  function zoomIn() {
    setZoom(zoom + 0.15);
  }

  function zoomOut() {
    setZoom(zoom - 0.15);
  }

  function reset() {
    zoom = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  // Cuộn chuột để zoom
  svg.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      setZoom(zoom + delta);
    },
    { passive: false }
  );

  // Kéo chuột để pan
  svg.style.cursor = 'grab';

  svg.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    svg.style.cursor = 'grabbing';
    svg.setPointerCapture(e.pointerId);
  });

  svg.addEventListener('pointermove', (e: PointerEvent) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
  });

  const stopDrag = (e: PointerEvent) => {
    if (isDragging) {
      isDragging = false;
      svg.style.cursor = 'grab';
      try {
        svg.releasePointerCapture(e.pointerId);
      } catch {
        // bỏ qua nếu đã tự release
      }
    }
  };

  svg.addEventListener('pointerup', stopDrag);
  svg.addEventListener('pointercancel', stopDrag);

  applyTransform();

  return {
    reset,
    zoomIn,
    zoomOut,
    getZoom: () => zoom,
  };
}
