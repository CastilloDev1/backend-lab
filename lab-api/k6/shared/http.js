import { check } from 'k6';
import http from 'k6/http';

const jsonParams = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/** Base URL del API (override: `BASE_URL=http://localhost:3000 k6 run ...`). */
export function getBaseUrl() {
  return __ENV.BASE_URL || 'http://host.docker.internal:3000';
}

/**
 * POST JSON. Por defecto Nest responde 200 en POST; se aceptan 200 y 201.
 * @param {string} url
 * @param {object} payload
 * @param {{ okStatuses?: number[] }} [opts] — ej. escenario crash: `[500]` o `[400,500]`
 */
export function postJson(url, payload, opts = {}) {
  const okStatuses = opts.okStatuses ?? [200, 201];
  const res = http.post(url, JSON.stringify(payload), jsonParams);
  const ok = okStatuses.includes(res.status);

  if (!ok) {
    console.log(`Error: Status ${res.status} - Body: ${res.body}`);
  } else {
    console.log(`Success (${res.status}): ${res.body}`);
  }

  check(res, {
    'status aceptable': (r) => okStatuses.includes(r.status),
  });

  return res;
}
