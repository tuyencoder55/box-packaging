// Helper tạo phần tử DOM an toàn theo quy ước dự án (tránh nối chuỗi HTML dài)

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  ...children: (Node | string | number | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (key === 'className' || key === 'class') {
      element.className = String(value);
    } else if (key === 'text' || key === 'textContent') {
      element.textContent = String(value);
    } else if (key === 'html' || key === 'innerHTML') {
      element.innerHTML = String(value);
    } else if (key === 'style') {
      if (typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.style.cssText = String(value);
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
    } else {
      element.setAttribute(key, String(value));
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (child instanceof Node) {
      element.appendChild(child);
    } else {
      element.appendChild(document.createTextNode(String(child)));
    }
  }

  return element;
}
