// Quản lý kho lưu trữ mẫu khuôn bế tự tạo của người dùng (Custom Saved Templates) trong localStorage
import type { DetectedBoxStructure, RawSegment } from './types';

export interface CustomTemplate {
  id: string; // e.g. "custom_1730310000000"
  name: string; // Tên mẫu hộp
  code: string; // Mã khuôn / mã công ty
  createdAt: number;
  sourceType: 'dxf' | 'svg';
  rawContent: string;
  segments: RawSegment[];
  bbox: [number, number, number, number];
  structure: DetectedBoxStructure;
  defaults: {
    l: number;
    w: number;
    h: number;
  };
}

const STORAGE_KEY = 'boxmaker:custom_templates';

const inMemoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return inMemoryStore.get(key) ?? null;
}

function setStorageItem(key: string, val: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
  } catch {
    // ignore
  }
  inMemoryStore.set(key, val);
}

/**
 * Lấy toàn bộ danh sách mẫu hộp tự tạo đã lưu của người dùng
 */
export function getCustomTemplates(): CustomTemplate[] {
  try {
    const raw = getStorageItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomTemplate[];
  } catch (err) {
    console.warn('Lỗi đọc custom templates:', err);
    return [];
  }
}

/**
 * Lưu mẫu hộp tự tạo mới hoặc cập nhật mẫu đã có
 */
export function saveCustomTemplate(
  tmpl: Omit<CustomTemplate, 'id' | 'createdAt'> & { id?: string }
): CustomTemplate {
  const list = getCustomTemplates();
  const id = tmpl.id || `custom_${Date.now()}`;
  const now = Date.now();

  const existingIdx = list.findIndex((t) => t.id === id);
  const fullTemplate: CustomTemplate = {
    ...tmpl,
    id,
    createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : now,
  };

  if (existingIdx >= 0) {
    list[existingIdx] = fullTemplate;
  } else {
    list.unshift(fullTemplate);
  }

  try {
    setStorageItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Lỗi lưu custom template vào localStorage:', err);
  }

  return fullTemplate;
}

/**
 * Xoá mẫu hộp tự tạo theo ID
 */
export function deleteCustomTemplate(id: string): void {
  const list = getCustomTemplates().filter((t) => t.id !== id);
  try {
    setStorageItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Lỗi xoá custom template:', err);
  }
}

/**
 * Tìm kiếm mẫu hộp tự tạo theo ID
 */
export function getCustomTemplateById(id: string): CustomTemplate | null {
  const list = getCustomTemplates();
  return list.find((t) => t.id === id) ?? null;
}

