// Bộ ghi tài liệu PDF ASCII tối thiểu, tính chính xác byte offset của bảng xref
export class PdfWriter {
  private objects: string[] = [];

  /**
   * Thêm một đối tượng PDF mới, trả về ID số nguyên (bắt đầu từ 1)
   */
  addObject(content: string): number {
    this.objects.push(content.trim());
    return this.objects.length;
  }

  /**
   * Xuất toàn bộ nội dung PDF với bảng xref và trailer chuẩn byte offset
   */
  build(): string {
    let out = '%PDF-1.5\n%BoxMaker\n';
    const offsets: number[] = [];

    // Ghi từng object và lưu lại byte offset của nó
    for (let i = 0; i < this.objects.length; i++) {
      // Đối với ASCII chuỗi, byte offset đúng bằng độ dài ký tự
      offsets.push(out.length);
      const id = i + 1;
      out += `${id} 0 obj\n${this.objects[i]}\nendobj\n`;
    }

    const xrefOffset = out.length;
    const totalObjs = this.objects.length + 1;

    out += `xref\n0 ${totalObjs}\n`;
    out += '0000000000 65535 f \n';

    for (let i = 0; i < offsets.length; i++) {
      const offStr = offsets[i].toString().padStart(10, '0');
      out += `${offStr} 00000 n \n`;
    }

    out += `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\n`;
    out += `startxref\n${xrefOffset}\n%%EOF\n`;

    return out;
  }
}

