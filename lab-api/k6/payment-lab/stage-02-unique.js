import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

/**
 * Stage 01 broken: misma externalReference en 2 VU => 2 payments (sin protección).
 * Seed: cuenta con balance; el escenario actual solo inserta payment.
 */
export default function () {
  const url = `${getBaseUrl()}/payment-lab/stage-01/unique/create-payment`;

  const payload = {
    accountId: 1,
    amount: 50000,
    externalReference: 'provider_payment-001',
  };

  postJson(url, payload);
}
