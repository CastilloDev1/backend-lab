import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

// export const options = burstSameTimeOptions;
export const options = {
  scenarios: {
    payments: {
      executor: 'shared-iterations',
      vus: 30,
      iterations: 10000,
      maxDuration: '2m',
    },
  },
};

/**
 * POST /payment-lab/payments — core/create-payment-outbox-preview
 * 2 VU, misma externalReference: prueba idempotencia / duplicados + outbox PENDING.
 */
export default function () {
  const externalReference = `provider-payment-${__VU}-${__ITER}-${Date.now()}`;
  const url = `${getBaseUrl()}/payment-lab/payments`;

  postJson(url, {
    accountId: 1,
    amount: 50000,
    externalReference,
  });
}
