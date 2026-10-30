import '../styles/base.css';
import { getAllBoxes } from '../boxes';
import { openImporterModal } from '../ui/importer/importerModal';
import { renderCardGrid } from '../ui/templates/cardGrid';
import { createFilterBar } from '../ui/templates/filterBar';

// Điểm vào trang thư viện mẫu: hiển thị lưới mẫu hộp và bộ lọc
function initTemplatesPage() {
  const allBoxes = getAllBoxes();
  let currentCategory = 'all';

  const filterContainer = document.getElementById('filter-bar');
  const gridContainer = document.getElementById('card-grid');

  // Header & Container styling
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 32px 24px; min-height: 100vh;';
  }

  const header = document.querySelector('header');
  if (header) {
    header.style.cssText = 'margin-bottom: 24px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px;';
    const backLink = header.querySelector('a');
    if (backLink) {
      backLink.style.cssText =
        'display: inline-block; margin-bottom: 12px; color: var(--text-muted); font-size: var(--font-size-sm); text-decoration: none;';
    }
    const h1 = header.querySelector('h1');
    if (h1) {
      h1.style.cssText = 'font-size: var(--font-size-2xl); font-weight: 700; color: var(--text-primary); margin: 0;';
    }
  }

  // Banner Nhập file DXF/SVG thông minh (No-Code Importer)
  const main = document.querySelector('main');
  if (main && !document.getElementById('importer-hero-banner')) {
    const banner = document.createElement('div');
    banner.id = 'importer-hero-banner';
    banner.style.cssText = `
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(0, 210, 135, 0.08) 100%);
      border: 1px solid rgba(0, 210, 135, 0.25);
      border-radius: 14px;
      padding: 18px 24px;
      margin-bottom: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    `;
    banner.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; background: #00d287; color: #000; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">Mới: No-Code Importer</span>
          <span style="font-size: 14px; font-weight: 700; color: #0f172a;">Tự do thêm mẫu thùng & co giãn không cần viết code</span>
        </div>
        <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; max-width: 720px;">
          Bạn có sẵn file khuôn từ khách hàng hoặc phần mềm CAD? Tải lên trực tiếp (.DXF từ AutoCAD hoặc .SVG từ Illustrator), hệ thống sẽ tự động phát hiện $L_0, W_0, H_0$ và co dãn thông minh bảo toàn 100% lưỡi dán, tai gài, đáy khoá.
        </p>
      </div>
      <button id="btn-banner-import" type="button" style="
        background: #00d287;
        color: #000;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0, 210, 135, 0.25);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      ">📥 Nhập file DXF / SVG ngay</button>
    `;

    const btn = banner.querySelector('#btn-banner-import') as HTMLButtonElement | null;
    if (btn) {
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 4px 12px rgba(0, 210, 135, 0.35)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 2px 8px rgba(0, 210, 135, 0.25)';
      });
      btn.addEventListener('click', () => {
        openImporterModal();
      });
    }

    main.insertBefore(banner, main.firstChild);
  }

  function updateView() {
    const filtered =
      currentCategory === 'all'
        ? allBoxes
        : allBoxes.filter((b) => b.category === currentCategory);

    if (filterContainer) {
      createFilterBar(filterContainer, currentCategory, (newCat) => {
        currentCategory = newCat;
        updateView();
      });
    }

    if (gridContainer) {
      renderCardGrid(gridContainer, filtered);
    }
  }

  updateView();
}

document.addEventListener('DOMContentLoaded', initTemplatesPage);
