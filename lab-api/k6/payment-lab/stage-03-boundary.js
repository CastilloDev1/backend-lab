import { postJson, getBaseUrl } from '../shared/http.js';


export const options = {
  vus: 20,          // usuarios concurrentes
  duration: '15s',  // duración de la prueba
};


/**
 * Stage 01 broken: misma externalReference en 2 VU => 2 payments (sin protección).
 * Seed: cuenta con balance; el escenario actual solo inserta payment.
 */
export default function () {
  const url = `${getBaseUrl()}/payment-lab/stage-03/broken-external-inside-transaction/create-payment`;

  const payload = {
    accountId: 1,
    amount: 50000,
    externalReference: `provider_payment-${Math.random()}`,
  };

  postJson(url, payload);
}
