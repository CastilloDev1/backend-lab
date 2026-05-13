import { postJson } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url =
    'http://host.docker.internal:3000/duplicate-executions?scenario=idempotent-execution';

  // Mismo caso que problem, pero contra el escenario idempotente.
  const payload = {
    accountId: 1,
    amount: 100,
    idempotenciaKey: 'pay_abc123',
  };

  postJson(url, payload);
}
