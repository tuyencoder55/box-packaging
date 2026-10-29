// Điều khiển hoạt hoạ gấp / mở hộp 3D theo bước (foldAnim)
import type { PanelHingeInfo } from './foldModel';

/**
 * Cập nhật góc gập của các bản lề dựa trên tiến độ tổng thể progress ∈ [0, 1]
 */
export function applyFoldProgress(hinges: Map<string, PanelHingeInfo>, progress: number) {
  const p = Math.max(0, Math.min(1, progress));

  // Tìm step lớn nhất
  let maxStep = 1;
  hinges.forEach((h) => {
    if (h.step > maxStep) maxStep = h.step;
  });

  hinges.forEach((h) => {
    // Với mỗi step, tỉ lệ gập từ 0 đến 1 trong khoảng thời gian tương ứng
    // Ví dụ maxStep = 3:
    // Step 1: progress từ 0 đến 1/3
    // Step 2: progress từ 1/3 đến 2/3
    // Step 3: progress từ 2/3 đến 1
    const factor = Math.max(0, Math.min(1, p * maxStep - (h.step - 1)));
    const rawAngle = h.sign * h.maxAngleRad * factor;
    const angle = Math.abs(rawAngle) < 1e-9 ? 0 : rawAngle;

    if (h.axis === 'x') {
      h.group.rotation.x = angle;
    } else {
      h.group.rotation.y = angle;
    }
  });
}

export interface FoldAnimator {
  getProgress: () => number;
  setProgress: (p: number) => void;
  playTo: (target: number, durationMs?: number) => void;
  toggle: () => void;
  stop: () => void;
}

export function createFoldAnimator(
  hinges: Map<string, PanelHingeInfo>,
  onUpdate?: (progress: number) => void,
): FoldAnimator {
  let currentProgress = 0;
  let animId: number | null = null;

  const setProgress = (val: number) => {
    currentProgress = Math.max(0, Math.min(1, val));
    applyFoldProgress(hinges, currentProgress);
    if (onUpdate) onUpdate(currentProgress);
  };

  const stop = () => {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  };

  const playTo = (target: number, durationMs: number = 1000) => {
    stop();
    const startProgress = currentProgress;
    const targetProgress = Math.max(0, Math.min(1, target));
    const delta = targetProgress - startProgress;

    if (Math.abs(delta) < 0.001) {
      setProgress(targetProgress);
      return;
    }

    const startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);

      // Easing cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(startProgress + delta * ease);

      if (t < 1) {
        animId = requestAnimationFrame(loop);
      } else {
        animId = null;
        setProgress(targetProgress);
      }
    };

    animId = requestAnimationFrame(loop);
  };

  const toggle = () => {
    if (currentProgress > 0.5) {
      playTo(0);
    } else {
      playTo(1);
    }
  };

  // Khởi tạo ở trạng thái phẳng (0)
  setProgress(0);

  return {
    getProgress: () => currentProgress,
    setProgress,
    playTo,
    toggle,
    stop,
  };
}
