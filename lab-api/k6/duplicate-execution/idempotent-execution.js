import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url = `${getBaseUrl()}/duplicate-execution/idempotency/pay`;

  const payload = {
    accountId: 1,
    amount: 100,
    idempotenciaKey: 'pay_abc123',
  };

  postJson(url, payload);
}
