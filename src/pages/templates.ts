import '../styles/base.css';
import { getAllBoxes } from '../boxes';
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
    header.style.cssText = 'margin-bottom: 32px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 20px;';
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
