/**
 * CAFFE CORE - Utilitários genéricos, sem dependência de nenhum componente.
 * Import isolado propositalmente: qualquer parte do engine.js (ou futuros
 * módulos) pode reaproveitar essas funções sem precisar do motor inteiro.
 */

/**
 * Agrupa chamadas repetidas de um callback para no máximo uma execução por
 * frame de animação (requestAnimationFrame). Usado para eventos de alta
 * frequência como 'scroll' e 'resize'.
 */
export function rafThrottle(fn) {
  let scheduled = false;

  return function throttled(...args) {
    if (scheduled) return;
    scheduled = true;
    const ctx = this;

    requestAnimationFrame(() => {
      fn.apply(ctx, args);
      scheduled = false;
    });
  };
}

/**
 * Retorna, na ordem do DOM, todos os elementos focáveis visíveis dentro de
 * um container. Base para o focus trap de modais e off-canvas.
 */
export function getFocusable(container) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input:not([disabled]), select:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/**
 * Prende a navegação por Tab/Shift+Tab dentro de `container` enquanto ele
 * estiver aberto — impede que o foco "vaze" para o conteúdo por trás de um
 * modal ou off-canvas. Retorna uma função para liberar o trap ao fechar.
 *
 * @param {HTMLElement} container
 * @returns {Function} releaseTrap — remove o listener; chamar ao fechar
 */
export function trapFocus(container) {
  if (!container) return () => {};

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusable(container);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);

  return function releaseTrap() {
    container.removeEventListener('keydown', handleKeydown);
  };
}
