import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url = `${getBaseUrl()}/toctou/broken/consume`;

  postJson(url, {
    resourceId: 1,
    amount: 1,
  });
}
