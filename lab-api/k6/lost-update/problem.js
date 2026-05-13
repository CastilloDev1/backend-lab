import { postJson } from '../shared/http.js';
import { burstSameTimeOptions } from '../shared/options.js';

export const options = burstSameTimeOptions;

export default function () {
  const url = 'http://host.docker.internal:3000/products?scenario=problem';
  const amount = __VU % 2 === 0 ? 2 : 3;

  // Stock inicial 10: sin lost update, dos descuentos de 2 y 3 deberian dejar 5.
  const payload = {
    id: 1,
    name: 'Producto 1',
    quantity: amount,
  };

  postJson(url, payload);
}
