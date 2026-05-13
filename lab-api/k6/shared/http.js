import { check } from 'k6';
import http from 'k6/http';

const jsonParams = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export function postJson(url, payload) {
  const res = http.post(url, JSON.stringify(payload), jsonParams);

  if (res.status !== 201) {
    console.log(`Error: Status ${res.status} - Body: ${res.body}`);
  } else {
    console.log(`Success: ${res.body}`);
  }

  check(res, {
    'is status 201': (response) => response.status === 201,
  });

  return res;
}
