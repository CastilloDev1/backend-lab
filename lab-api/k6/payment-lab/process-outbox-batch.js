import { postJson, getBaseUrl } from '../shared/http.js';

export const options = {
  scenarios: {
    process_outbox_batch: {
      executor: 'shared-iterations',
      vus: 20,
      iterations: 1000,
      maxDuration: '2m',
    },
  },
};

/**
 * POST /payment-lab/outbox/process-batch — processBatch(10)
 * Varios workers en paralelo (SKIP LOCKED). Ejecutar después de payments.js
 * si hay eventos PENDING.
 */
export default function () {
  const url = `${getBaseUrl()}/payment-lab/outbox/process-batch`;

  postJson(url, {});
}
