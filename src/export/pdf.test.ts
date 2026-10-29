import { describe, expect, it } from 'vitest';
import { generatePdfContent } from './pdf';
import type { Dieline } from '../core/types';

describe('export/pdf', () => {
  it('sinh mã PDF chuẩn in ấn với các layer, màu pha và bảng xref chính xác', () => {
    const dieline: Dieline = {
      cut: [
        { a: [0, 0], b: [100, 0] },
        { a: [100, 0], b: [100, 50] },
        { a: [100, 50], b: [0, 50] },
        { a: [0, 50], b: [0, 0] },
      ],
      crease: [{ a: [50, 0], b: [50, 50] }],
      polys: [],
      bbox: [0, 0, 100, 50],
    };

    const pdf = generatePdfContent(dieline, 5);

    // 1. Kiểm tra header và footer
    expect(pdf.startsWith('%PDF-1.5')).toBe(true);
    expect(pdf.endsWith('%%EOF\n')).toBe(true);

    // 2. Kiểm tra Layer và Màu pha
    expect(pdf).toContain('/OCProperties');
    expect(pdf).toContain('/OCG');
    expect(pdf).toContain('/Separation /CUT');
    expect(pdf).toContain('/Separation /CREASE');
    expect(pdf).toContain('/GS_OP');

    // 3. Kiểm tra các khối OCG BDC ... EMC
    const bdcMatches = pdf.match(/BDC/g);
    const emcMatches = pdf.match(/EMC/g);
    expect(bdcMatches?.length).toBe(2);
    expect(emcMatches?.length).toBe(2);

    // 4. Kiểm tra tính chính xác của bảng xref
    const startXrefMatch = pdf.match(/startxref\n(\d+)\n%%EOF/);
    expect(startXrefMatch).not.toBeNull();
    const xrefOffset = parseInt(startXrefMatch![1], 10);

    // Chuỗi tại vị trí xrefOffset phải là 'xref\n'
    expect(pdf.substring(xrefOffset, xrefOffset + 5)).toBe('xref\n');

    // Kiểm tra từng entry trong bảng xref trỏ đúng tới dòng 'N 0 obj'
    const xrefLines = pdf.substring(xrefOffset).split('\n');
    expect(xrefLines[1]).toBe('0 12'); // 12 entries (đối tượng 0 đến 11)

    for (let i = 1; i <= 11; i++) {
      const line = xrefLines[2 + (i - 1) + 1]; // dòng 0: xref, dòng 1: 0 12, dòng 2: entry 0, dòng 3: obj 1...
      const offset = parseInt(line.substring(0, 10), 10);
      const expectedObjHeader = `${i} 0 obj`;
      expect(pdf.substring(offset, offset + expectedObjHeader.length)).toBe(expectedObjHeader);
    }
  });

  it('sinh mã PDF có layer DIMENSION khi truyền dimLines', () => {
    const dieline: Dieline = {
      cut: [],
      crease: [],
      polys: [],
      bbox: [0, 0, 100, 50],
    };

    const pdf = generatePdfContent(dieline, 5, [
      {
        start: [0, 25],
        end: [100, 25],
        label: '100 mm',
        mid: [50, 20],
      },
    ]);

    expect(pdf).toContain('/OC_DIM');
    expect(pdf).toContain('(100 mm) Tj');
    expect(pdf).toContain('/Helvetica');
  });
});
