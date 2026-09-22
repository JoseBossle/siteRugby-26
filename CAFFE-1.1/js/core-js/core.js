/**
 * CAFFE CORE - Utilitários genéricos, sem dependência de nenhum componente.
 * Import isolado propositalmente: qualquer parte do engine.js (ou futuros
 * módulos) pode reaproveitar essas funções sem precisar do motor inteiro.
 */

/**
 * Agrupa chamadas repetidas de um callback para no máximo uma execução por
 * frame de animação (requestAnimationFrame). Usado para eventos de alta
 * frequência como 'scroll' e 'resize', evitando trabalho redundante de
 * layout/estilo a cada pixel rolado.
 *
 * @param {Function} fn - callback a ser executado no máximo 1x por frame
 * @returns {Function} versão "throttled" de fn, mesma assinatura de chamada
 */
export function rafThrottle(fn) {
  let scheduled = false;

  return function throttled(...args) {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      fn.apply(this, args);
      scheduled = false;
    });
  };
}
