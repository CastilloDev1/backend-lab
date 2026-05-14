import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

/**
 * Primer hit: crash simulado → suele ser 500.
 * Reintentos concurrentes: 400 (en proceso) u otros; se aceptan códigos típicos del lab.
 */
export default function () {
  const url = `${getBaseUrl()}/duplicate-execution/crash/pay`;

  const payload = {
    accountId: 1,
    amount: 100,
    idempotenciaKey: 'pay_crash_k6',
  };

  postJson(url, payload, { okStatuses: [200, 201, 400, 409, 500] });
}
