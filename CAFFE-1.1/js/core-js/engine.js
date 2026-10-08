/**
 * CAFFE ENGINE - Motor de Automação de Comportamentos v3.0
 * Agora com: focus trap real em overlays (modal/off-canvas), sincronização
 * ARIA no sistema de abas, e aria-current="page" na navegação.
 */

import { rafThrottle, getFocusable, trapFocus } from './core.js';

export const UIEngine = {
  // Estado do overlay ativo no momento (só um por vez, por design)
  _overlay: {
    target: null,
    trigger: null,
    releaseTrap: null,
  },

  init() {
    this.handleToggles();
    this.handleSmoothScroll();
    this.handleStickyHeader();
    this.handleModals();
    this.handleTabs();
    this.initTheme();
    this.handleCarousel();
    this.handleActiveNavLink();
  },

  // --- Focus trap interno, compartilhado por modal e off-canvas ---
  _openOverlay(target, trigger) {
    this._overlay.target = target;
    this._overlay.trigger = trigger;

    const panel = target.querySelector('.modal__content, .offcanvas__panel') || target;
    this._overlay.releaseTrap = trapFocus(panel);

    const focusable = getFocusable(panel);
    (focusable[0] || panel).focus();
  },

  _closeOverlay() {
    if (this._overlay.releaseTrap) {
      this._overlay.releaseTrap();
    }
    this._overlay.target?.classList.remove('is-active');
    this._overlay.trigger?.setAttribute('aria-expanded', 'false');
    this._overlay.trigger?.focus();

    this._overlay = { target: null, trigger: null, releaseTrap: null };
  },

  // 1. Alternância Genérica via [data-toggle] — overlays (modal/off-canvas)
  // ganham focus trap automático; os demais (dropdown, nav-menu) seguem
  // apenas com o toggle simples de classe.
  handleToggles() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-toggle]');
      if (!trigger) return;

      const targetSelector = trigger.dataset.toggle;
      const target = document.querySelector(targetSelector);
      if (!target) return;

      const isOverlay = target.classList.contains('modal') || target.classList.contains('offcanvas');
      const isActive = target.classList.contains('is-active');

      if (isOverlay) {
        if (isActive) {
          this._closeOverlay();
        } else {
          target.classList.add('is-active');
          trigger.setAttribute('aria-expanded', 'true');
          this._openOverlay(target, trigger);
        }
        return;
      }

      target.classList.toggle('is-active', !isActive);
      trigger.setAttribute('aria-expanded', String(!isActive));
    });
  },

  // 2. Fechamento de Overlays por Clique no Backdrop ou Tecla ESC
  handleModals() {
    document.addEventListener('click', (e) => {
      const isModalBackdrop = e.target.classList.contains('modal')
                           && e.target.classList.contains('is-active');
      const isOffcanvasBackdrop = e.target.classList.contains('offcanvas')
                               && e.target.classList.contains('is-active');

      if (isModalBackdrop || isOffcanvasBackdrop) {
        this._closeOverlay();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._overlay.target) {
        this._closeOverlay();
      }
    });
  },

  // 3. Sistema de Abas — troca de painel + sincronização ARIA completa
  handleTabs() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab-target]');
      if (!tabBtn) return;

      const targetSelector = tabBtn.dataset.tabTarget;
      const targetPanel = document.querySelector(targetSelector);
      if (!targetPanel) return;

      const navContainer = tabBtn.closest('.tabs-nav');
      if (navContainer) {
        navContainer.querySelectorAll('[data-tab-target]').forEach((btn) => {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-selected', 'false');
          btn.setAttribute('tabindex', '-1');
        });
      }
      tabBtn.classList.add('is-active');
      tabBtn.setAttribute('aria-selected', 'true');
      tabBtn.setAttribute('tabindex', '0');

      const parentContainer = targetPanel.closest('.tabs-container') || document;
      parentContainer.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.remove('is-active');
      });
      targetPanel.classList.add('is-active');
    });

    // Estado ARIA inicial — cobre a aba que já nasce .is-active no HTML,
    // sem depender do usuário clicar primeiro.
    document.querySelectorAll('.tabs-nav').forEach((nav) => {
      nav.setAttribute('role', 'tablist');
      nav.querySelectorAll('[data-tab-target]').forEach((btn) => {
        btn.setAttribute('role', 'tab');
        const active = btn.classList.contains('is-active');
        btn.setAttribute('aria-selected', String(active));
        btn.setAttribute('tabindex', active ? '0' : '-1');
      });
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.setAttribute('role', 'tabpanel');
    });
  },

  // 4. Tema Dark/Light
  initTheme() {
    if (!document.documentElement.hasAttribute('data-theme')) {
      const savedTheme = localStorage.getItem('caffe-theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

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
        behavior: 'smooth',
      });
    });
  },

  // 6. Scroll Suave para links internos — ignora links que são triggers de overlay
  handleSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || link.hash === '') return;
      if (link.hasAttribute('data-toggle')) return;

      const target = document.querySelector(link.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', link.hash);
        this._updateActiveNavLink();
      }
    });
  },

  // 7. Header Sticky Dinâmico (agrupado por frame via rafThrottle)
  handleStickyHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    window.addEventListener('scroll', rafThrottle(() => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 50);
      header.classList.toggle('is-transparent', y > 150);
    }), { passive: true });
  },

  // 8. Indicação do link de navegação ativo (aria-current="page")
  handleActiveNavLink() {
    if (!document.querySelectorAll('.nav-link[href^="#"]').length) return;

    this._updateActiveNavLink();
    window.addEventListener('hashchange', () => this._updateActiveNavLink());
  },

  _updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!navLinks.length) return;

    const currentHash = window.location.hash || navLinks[0].getAttribute('href');
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === currentHash) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  },
};
