/**
 * CAFFE ENGINE - Motor de Automação de Comportamentos v2.1
 * Unificado e sem dependências externas órfãs.
 */

import { rafThrottle } from './core.js';

export const UIEngine = {
  init() {
    this.handleToggles();
    this.handleSmoothScroll();
    this.handleStickyHeader();
    this.handleModals();
    this.handleTabs();
    this.initTheme();
    this.handleCarousel(); // Executa internamente sem necessidade de importação externa
  },

  // 1. Alternância Genérica via [data-toggle] (Modais, Menus, Off-canvas, Dropdown, etc.)
  handleToggles() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-toggle]');
      if (!trigger) return;

      const targetSelector = trigger.dataset.toggle;
      const target = document.querySelector(targetSelector);

      if (target) {
        const isActive = target.classList.contains('is-active');
        target.classList.toggle('is-active', !isActive);
        trigger.setAttribute('aria-expanded', !isActive);
      }
    });
  },

  // 2. Fechamento de Overlays (Modais e Off-canvas) por Clique Externo ou Tecla ESC
  handleModals() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.classList.remove('is-active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.is-active, .offcanvas.is-active').forEach(el => {
          el.classList.remove('is-active');
        });
      }
    });
  },

  // 3. Sistema de Abas (Tabs) via [data-tab-target]
  handleTabs() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab-target]');
      if (!tabBtn) return;

      const targetSelector = tabBtn.dataset.tabTarget;
      const targetPanel = document.querySelector(targetSelector);
      if (!targetPanel) return;

      const navContainer = tabBtn.closest('.tabs-nav');
      if (navContainer) {
        navContainer.querySelectorAll('[data-tab-target]').forEach(btn => {
          btn.classList.remove('is-active');
        });
      }
      tabBtn.classList.add('is-active');

      const parentContainer = targetPanel.closest('.tabs-container') || document;
      parentContainer.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('is-active');
      });

      targetPanel.classList.add('is-active');
    });
  },

  // 4. Alternador de Tema Dark/Light com LocalStorage sincronizado com Design Tokens
  initTheme() {
    const savedTheme = localStorage.getItem('caffe-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.addEventListener('click', (e) => {
      const themeToggle = e.target.closest('[data-theme-toggle]');
      if (!themeToggle) return;

      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('caffe-theme', newTheme);
    });
  },

  // 5. Automação do Carrossel Nativo Baseado em Atributos de Dados
  handleCarousel() {
    document.addEventListener('click', (e) => {
      const prevBtn = e.target.closest('[data-carousel-prev]');
      const nextBtn = e.target.closest('[data-carousel-next]');

      const btn = prevBtn || nextBtn;
      if (!btn) return;

      const targetSelector = btn.dataset.carouselPrev || btn.dataset.carouselNext;
      const carousel = document.querySelector(targetSelector);
      if (!carousel) return;

      const viewport = carousel.querySelector('.c-carousel__viewport');
      if (!viewport) return;

      const scrollAmount = viewport.clientWidth;

      viewport.scrollBy({
        left: prevBtn ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    });
  },

  // 6. Scroll Suave Automático para links internos
  handleSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || link.hash === '') return;

      const target = document.querySelector(link.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  },

  // 7. Header Sticky Dinâmico ao rolar a página
  // (agrupado por frame via rafThrottle — evita rodar o toggle de classe a
  // cada evento de scroll bruto disparado pelo navegador)
  handleStickyHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    window.addEventListener('scroll', rafThrottle(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 50);
    }), { passive: true });
  }
};
