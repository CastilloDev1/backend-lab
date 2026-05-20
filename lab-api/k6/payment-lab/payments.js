import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

/**
 * POST /payment-lab/payments — core/create-payment-outbox-preview
 * 2 VU, misma externalReference: prueba idempotencia / duplicados + outbox PENDING.
 */
export default function () {
  const url = `${getBaseUrl()}/payment-lab/payments`;

  postJson(url, {
    accountId: 1,
    amount: 50000,
    externalReference: 'provider-payment-001',
  });
}
