import { postJson, getBaseUrl } from '../shared/http.js';

export const options = {
  scenarios: {
    process_outbox: {
      executor: 'shared-iterations',
      vus: 30,
      iterations: 10000,
      maxDuration: '2m',
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
