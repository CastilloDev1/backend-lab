import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url = `${getBaseUrl()}/double-spending/atomic-balance-update/pay`;

  postJson(url, {
    walletId: 1,
    amount: 100,
  });
}
