// Bộ phân tích file SVG kỹ thuật thành các đoạn thẳng Cut và Crease (hỗ trợ cả môi trường Node và Browser)
import type { Pt } from '../core/types';
import type { RawSegment } from './types';

export function parseSvgString(svgContent: string): { segments: RawSegment[]; bbox: [number, number, number, number] } {
  const segments: RawSegment[] = [];

  // 1. Phân tích theo các khối <g ...>...</g>
  const groupRegex = /<g\b([^>]*)>([\s\S]*?)<\/g>/gi;
  let groupMatch: RegExpExecArray | null;
  let matchedGroupRange = false;

  while ((groupMatch = groupRegex.exec(svgContent)) !== null) {
    matchedGroupRange = true;
    const gAttrs = groupMatch[1].toLowerCase();
    const gBody = groupMatch[2];

    const isCreaseGroup =
      gAttrs.includes('crease') ||
      gAttrs.includes('fold') ||
      gAttrs.includes('cấn') ||
      gAttrs.includes('can') ||
      gAttrs.includes('#ef4444') ||
      gAttrs.includes('red') ||
      gAttrs.includes('#ff4d4f') ||
      gAttrs.includes('stroke-dasharray');

    const defaultType: 'cut' | 'crease' = isCreaseGroup ? 'crease' : 'cut';
    parseElementsFromBody(gBody, defaultType, segments);
  }

  // 2. Nếu file SVG không chia khối <g> rõ ràng, quét toàn bộ file
  if (!matchedGroupRange || segments.length === 0) {
    parseElementsFromBody(svgContent, 'cut', segments);
  }

  if (segments.length === 0) {
    return { segments: [], bbox: [0, 0, 0, 0] };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const s of segments) {
    minX = Math.min(minX, s.a[0], s.b[0]);
    minY = Math.min(minY, s.a[1], s.b[1]);
    maxX = Math.max(maxX, s.a[0], s.b[0]);
    maxY = Math.max(maxY, s.a[1], s.b[1]);
  }

  return {
    segments,
    bbox: [minX, minY, maxX - minX, maxY - minY],
  };
}

function parseElementsFromBody(body: string, defaultType: 'cut' | 'crease', outSegments: RawSegment[]): void {
  // A. Line
  const lineRegex = /<line\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = lineRegex.exec(body)) !== null) {
    const attrs = match[1];
    const x1 = getAttrFloat(attrs, 'x1');
    const y1 = getAttrFloat(attrs, 'y1');
    const x2 = getAttrFloat(attrs, 'x2');
    const y2 = getAttrFloat(attrs, 'y2');

    if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
      const type = getExplicitType(attrs, defaultType);
      outSegments.push({ type, a: [x1, y1], b: [x2, y2] });
    }
  }

  // B. Rect
  const rectRegex = /<rect\b([^>]*)\/?>/gi;
  while ((match = rectRegex.exec(body)) !== null) {
    const attrs = match[1];
    const x = getAttrFloat(attrs, 'x') ?? 0;
    const y = getAttrFloat(attrs, 'y') ?? 0;
    const w = getAttrFloat(attrs, 'width');
    const h = getAttrFloat(attrs, 'height');

    if (w !== null && h !== null && w > 0 && h > 0) {
      const type = getExplicitType(attrs, defaultType);
      outSegments.push({ type, a: [x, y], b: [x + w, y] });
      outSegments.push({ type, a: [x + w, y], b: [x + w, y + h] });
      outSegments.push({ type, a: [x + w, y + h], b: [x, y + h] });
      outSegments.push({ type, a: [x, y + h], b: [x, y] });
    }
  }

  // C. Polyline & Polygon
  const polyRegex = /<(polyline|polygon)\b([^>]*)\/?>/gi;
  while ((match = polyRegex.exec(body)) !== null) {
    const isPolygon = match[1].toLowerCase() === 'polygon';
    const attrs = match[2];
    const ptsMatch = attrs.match(/points\s*=\s*["']([^"']+)["']/i);
    if (ptsMatch) {
      const nums = ptsMatch[1].trim().split(/[\s,]+/).map(parseFloat).filter((n) => !isNaN(n));
      const pts: Pt[] = [];
      for (let i = 0; i < nums.length - 1; i += 2) {
        pts.push([nums[i], nums[i + 1]]);
      }
      const type = getExplicitType(attrs, defaultType);
      for (let i = 0; i < pts.length - 1; i++) {
        outSegments.push({ type, a: pts[i], b: pts[i + 1] });
      }
      if (isPolygon && pts.length > 2) {
        outSegments.push({ type, a: pts[pts.length - 1], b: pts[0] });
      }
    }
  }

  // D. Path
  const pathRegex = /<path\b([^>]*)\/?>/gi;
  while ((match = pathRegex.exec(body)) !== null) {
    const attrs = match[1];
    const dMatch = attrs.match(/d\s*=\s*["']([^"']+)["']/i);
    if (dMatch) {
      const type = getExplicitType(attrs, defaultType);
      const pathSegs = parsePathCommands(dMatch[1], type);
      outSegments.push(...pathSegs);
    }
  }
}

function getAttrFloat(attrs: string, name: string): number | null {
  const m = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  if (!m) return null;
  const val = parseFloat(m[1]);
  return isNaN(val) ? null : val;
}

function getExplicitType(attrs: string, defaultType: 'cut' | 'crease'): 'cut' | 'crease' {
  const lower = attrs.toLowerCase();
  if (
    lower.includes('crease') ||
    lower.includes('stroke-dasharray') ||
    lower.includes('#ef4444') ||
    lower.includes('red') ||
    lower.includes('#ff4d4f')
  ) {
    return 'crease';
  }
  if (lower.includes('cut') || lower.includes('#2563eb') || lower.includes('blue') || lower.includes('#00d287')) {
    return 'cut';
  }
  return defaultType;
}

function parsePathCommands(d: string, type: 'cut' | 'crease'): RawSegment[] {
  const segs: RawSegment[] = [];
  const tokens = d.match(/([a-zA-Z]|[-+]?[0-9]*\.?[0-9]+(?:e[-+]?[0-9]+)?)/gi) ?? [];

  let curX = 0;
  let curY = 0;
  let startX = 0;
  let startY = 0;
  let cmd = '';
  let i = 0;

  while (i < tokens.length) {
    const tok = tokens[i];
    if (/^[a-zA-Z]$/.test(tok)) {
      cmd = tok;
      i++;
    }

    if (cmd === 'M') {
      curX = parseFloat(tokens[i++]);
      curY = parseFloat(tokens[i++]);
      startX = curX;
      startY = curY;
      cmd = 'L';
    } else if (cmd === 'm') {
      curX += parseFloat(tokens[i++]);
      curY += parseFloat(tokens[i++]);
      startX = curX;
      startY = curY;
      cmd = 'l';
    } else if (cmd === 'L') {
      const nextX = parseFloat(tokens[i++]);
      const nextY = parseFloat(tokens[i++]);
      segs.push({ type, a: [curX, curY], b: [nextX, nextY] });
      curX = nextX;
      curY = nextY;
    } else if (cmd === 'l') {
      const nextX = curX + parseFloat(tokens[i++]);
      const nextY = curY + parseFloat(tokens[i++]);
      segs.push({ type, a: [curX, curY], b: [nextX, nextY] });
      curX = nextX;
      curY = nextY;
    } else if (cmd === 'H') {
      const nextX = parseFloat(tokens[i++]);
      segs.push({ type, a: [curX, curY], b: [nextX, curY] });
      curX = nextX;
    } else if (cmd === 'h') {
      const nextX = curX + parseFloat(tokens[i++]);
      segs.push({ type, a: [curX, curY], b: [nextX, curY] });
      curX = nextX;
    } else if (cmd === 'V') {
      const nextY = parseFloat(tokens[i++]);
      segs.push({ type, a: [curX, curY], b: [curX, nextY] });
      curY = nextY;
    } else if (cmd === 'v') {
      const nextY = curY + parseFloat(tokens[i++]);
      segs.push({ type, a: [curX, curY], b: [curX, nextY] });
      curY = nextY;
    } else if (cmd === 'Z' || cmd === 'z') {
      if (curX !== startX || curY !== startY) {
        segs.push({ type, a: [curX, curY], b: [startX, startY] });
        curX = startX;
        curY = startY;
      }
    } else {
      i++;
    }
  }

  return segs;
}
