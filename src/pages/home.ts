import '../styles/base.css';
import { getAllBoxes } from '../boxes';
import { renderCardGrid } from '../ui/templates/cardGrid';

function initHomePage() {
  // Bổ sung style trực tiếp cho trang chủ
  const style = document.createElement('style');
  style.textContent = `
    #home-app {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .home-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--text-primary);
    }

    .logo-box {
      font-size: 24px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: 500;
      transition: color 0.15s ease;
    }

    .nav-links a:hover {
      color: var(--text-primary);
    }

    .btn-nav-studio {
      background: var(--color-primary) !important;
      color: var(--color-primary-fg) !important;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-weight: 600 !important;
    }

    .hero-section {
      padding: 70px 0 50px;
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-block;
      padding: 6px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: 2.8rem;
      font-weight: 800;
      line-height: 1.2;
      margin: 0 0 20px;
      color: var(--text-primary);
    }

    .gradient-text {
      background: linear-gradient(135deg, #00d287 0%, #2bd99b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0 0 32px;
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .btn-primary-large {
      background: var(--color-primary);
      color: var(--color-primary-fg);
      text-decoration: none;
      font-weight: 700;
      font-size: var(--font-size-md);
      padding: 14px 28px;
      border-radius: var(--radius-md);
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .btn-primary-large:hover {
      transform: translateY(-2px);
      opacity: 0.95;
    }

    .btn-secondary-large {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 600;
      font-size: var(--font-size-md);
      padding: 14px 28px;
      border-radius: var(--radius-md);
      transition: background 0.15s ease;
    }

    .btn-secondary-large:hover {
      background: var(--bg-card);
    }

    .features-section {
      padding: 40px 0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .feature-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 24px;
    }

    .feature-icon {
      font-size: 32px;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: var(--font-size-md);
      font-weight: 600;
      margin: 0 0 10px;
      color: var(--text-primary);
    }

    .feature-card p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0;
    }

    .featured-boxes-section {
      padding: 50px 0;
    }

    .section-header {
      margin-bottom: 24px;
    }

    .section-header h2 {
      font-size: var(--font-size-xl);
      font-weight: 700;
      margin: 0 0 6px;
      color: var(--text-primary);
    }

    .section-header p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .home-footer {
      margin-top: auto;
      padding: 30px 0;
      border-top: 1px solid var(--border-subtle);
      text-align: center;
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }
  `;
  document.head.appendChild(style);

  // Render lưới mẫu tiêu biểu
  const featuredContainer = document.getElementById('featured-grid');
  if (featuredContainer) {
    const boxes = getAllBoxes();
    renderCardGrid(featuredContainer, boxes);
  }
}

document.addEventListener('DOMContentLoaded', initHomePage);
