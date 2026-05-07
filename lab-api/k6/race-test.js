import http from 'k6/http';
import { check } from 'k6';

export const options = {
  // 5 usuarios virtuales atacando exactamente al mismo tiempo
  vus: 5, 
  iterations: 5,
};

export default function () {
  const url = 'http://host.docker.internal:3000/payments';
  
  // Enviamos siempre el mismo externalId para simular el reintento agresivo
  // o el fallo de lógica de negocio.
  const payload = JSON.stringify({
    userId: '11111111-1111-1111-1111-111111111111',
    amount: 200,
    externalId: 'PAY-12345' 
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  if (res.status !== 201) {
    console.log(`❌ Error: Status ${res.status} - Body: ${res.body}`);
  } else {
    console.log(`✅ Success: ${res.body}`);
  }
  
  check(res, {
    'is status 201': (r) => r.status === 201,
  });
}