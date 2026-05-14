import { postJson, getBaseUrl } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url = `${getBaseUrl()}/lost-update/broken/discount`;
  const amount = __VU % 2 === 0 ? 2 : 3;

  const payload = {
    id: 1,
    name: 'Producto 1',
    quantity: amount,
  };

  postJson(url, payload);
}
