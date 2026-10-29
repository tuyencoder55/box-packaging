// Thuật toán nối các đoạn thẳng rời rạc thành polyline liền mạch (chain)
import type { Pt, Seg } from './types';

export interface Polyline {
  pts: Pt[];
  closed: boolean;
}

function ptKey(pt: Pt): string {
  return `${pt[0].toFixed(3)},${pt[1].toFixed(3)}`;
}

function dist(p1: Pt, p2: Pt): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Nối các đoạn rời rạc Seg[] thành các chuỗi polyline liền
 */
export function chainSegments(segs: Seg[]): Polyline[] {
  if (segs.length === 0) return [];

  // 1. Dựng bảng liên kết điểm -> danh sách các đoạn chạm vào điểm đó
  interface NodeRef {
    segIdx: number;
    isA: boolean; // true nếu là điểm a, false nếu là b
  }

  const pointMap = new Map<string, NodeRef[]>();

  segs.forEach((seg, idx) => {
    const ka = ptKey(seg.a);
    const kb = ptKey(seg.b);

    const listA = pointMap.get(ka) ?? [];
    listA.push({ segIdx: idx, isA: true });
    pointMap.set(ka, listA);

    const listB = pointMap.get(kb) ?? [];
    listB.push({ segIdx: idx, isA: false });
    pointMap.set(kb, listB);
  });

  const used = new Array<boolean>(segs.length).fill(false);
  const polylines: Polyline[] = [];

  // Ưu tiên duyệt các đoạn bắt đầu từ điểm mút (degree !== 2) trước
  // Sau đó mới duyệt các vòng khép kín (toàn bộ degree = 2)
  const startOrder: number[] = [];

  // Tìm các đoạn có ít nhất một đầu có bậc khác 2
  segs.forEach((seg, idx) => {
    const degA = pointMap.get(ptKey(seg.a))?.length ?? 0;
    const degB = pointMap.get(ptKey(seg.b))?.length ?? 0;
    if (degA !== 2 || degB !== 2) {
      startOrder.push(idx);
    }
  });

  segs.forEach((_, idx) => {
    if (!startOrder.includes(idx)) {
      startOrder.push(idx);
    }
  });

  for (const startIdx of startOrder) {
    if (used[startIdx]) continue;

    used[startIdx] = true;
    const s0 = segs[startIdx];

    // Bắt đầu chuỗi điểm
    let pts: Pt[] = [s0.a, s0.b];
    let closed = false;

    // 2. Kéo dài về phía cuối (pts[pts.length - 1])
    let extending = true;
    while (extending) {
      const tail = pts[pts.length - 1];
      const kTail = ptKey(tail);
      const candidates = pointMap.get(kTail)?.filter((ref) => !used[ref.segIdx]) ?? [];

      if (candidates.length === 1) {
        const nextRef = candidates[0];
        used[nextRef.segIdx] = true;
        const nextSeg = segs[nextRef.segIdx];
        const nextPt = nextRef.isA ? nextSeg.b : nextSeg.a;

        // Kiểm tra xem có chạm lại điểm đầu pts[0] tạo vòng khép kín không
        if (ptKey(nextPt) === ptKey(pts[0])) {
          closed = true;
          extending = false;
        } else {
          pts.push(nextPt);
        }
      } else {
        // Hoặc không có đoạn nối tiếp, hoặc ngã ba (>=2) -> dừng kéo dài
        extending = false;
      }
    }

    // 3. Nếu chưa khép kín, kéo dài ngược lại về phía đầu (pts[0])
    if (!closed) {
      extending = true;
      while (extending) {
        const head = pts[0];
        const kHead = ptKey(head);
        const candidates = pointMap.get(kHead)?.filter((ref) => !used[ref.segIdx]) ?? [];

        if (candidates.length === 1) {
          const prevRef = candidates[0];
          used[prevRef.segIdx] = true;
          const prevSeg = segs[prevRef.segIdx];
          const prevPt = prevRef.isA ? prevSeg.b : prevSeg.a;

          if (ptKey(prevPt) === ptKey(pts[pts.length - 1])) {
            closed = true;
            extending = false;
          } else {
            pts.unshift(prevPt);
          }
        } else {
          extending = false;
        }
      }
    }

    // Nếu khép kín, đảm bảo điểm cuối không trùng lặp trong mảng pts
    if (closed && pts.length > 2) {
      if (ptKey(pts[0]) === ptKey(pts[pts.length - 1])) {
        pts.pop();
      }
    }

    polylines.push({ pts, closed });
  }

  return polylines;
}

/**
 * Tính tổng độ dài của mảng Polyline
 */
export function calcPolylineLength(lines: Polyline[]): number {
  let total = 0;
  for (const line of lines) {
    for (let i = 0; i < line.pts.length - 1; i++) {
      total += dist(line.pts[i], line.pts[i + 1]);
    }
    if (line.closed && line.pts.length > 1) {
      total += dist(line.pts[line.pts.length - 1], line.pts[0]);
    }
  }
  return total;
}

