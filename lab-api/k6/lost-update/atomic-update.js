import { postJson } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url = 'http://host.docker.internal:3000/products?scenario=atomic-update';
  const amount = __VU % 2 === 0 ? 2 : 3;

  // Stock inicial 10: el update atomico debe dejar 5 despues de ambos requests.
  const payload = {
    id: 1,
    name: 'Producto 1',
    quantity: amount,
  };

  postJson(url, payload);
}
