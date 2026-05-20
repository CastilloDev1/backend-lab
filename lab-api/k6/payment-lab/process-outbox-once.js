import { postJson, getBaseUrl } from '../shared/http.js';

export const options = {
  scenarios: {
    process_outbox: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 2,
      maxDuration: '30s',
    },
  },
};

/**
 * POST /payment-lab/outbox/process-once — core/process-outbox-events.worker
 * Varios workers llaman processOnce (SKIP LOCKED). Ejecutar después de payments.js
 * si hay eventos PENDING.
 */
export default function () {
  const url = `${getBaseUrl()}/payment-lab/outbox/process-once`;

  postJson(url, {});
}
