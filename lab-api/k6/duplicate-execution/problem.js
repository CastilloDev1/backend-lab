import { postJson } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url =
    'http://host.docker.internal:3000/duplicate-executions?scenario=problem';

  // Balance inicial 200: dos ejecuciones duplicadas de 100 deben exponer el problema.
  const payload = {
    accountId: 1,
    amount: 100,
  };

  postJson(url, payload);
}
