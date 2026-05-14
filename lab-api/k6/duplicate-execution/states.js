import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url = `${getBaseUrl()}/duplicate-execution/states/pay`;

  const payload = {
    accountId: 1,
    amount: 100,
    operationKey: `op_states_${__VU}_${__ITER}`,
  };

  postJson(url, payload);
}
