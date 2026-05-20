# Stage 02 — Atomicity

## 1. Qué problema existía

Con `UNIQUE` activo, un retry duplicado descontaba balance aunque el segundo `payment` no se creara.

## 2. Cómo lo replicabas

**Estado roto (misma lógica que stage 01 unique):** `POST /payment-lab/stage-01/unique/create-payment`  
**Corregido:** `POST /payment-lab/stage-02/fixed-with-transaction/create-payment`

```json
{
  "accountId": 1,
  "amount": 50000,
  "externalReference": "provider-payment-001"
}
```

Dos requests iguales (k6: `k6/payment-lab/stage-02-transaction.js`).

## 3. Qué daño causaba

Balance descontado sin fila en `payment`, pérdida de dinero sin trazabilidad.

## 4. Por qué ocurría (causa raíz)

`UPDATE account` e `INSERT payment` como queries sueltas. `UNIQUE` rechaza el duplicado pero no revierte el `UPDATE` previo.

## 5. Qué solución aplicaste

Transacción PostgreSQL: `UPDATE account` + `INSERT payment` en la misma TX; `ROLLBACK` si falla el `INSERT`.

## 6. Dónde está esa solución hoy (archivo en core/)

`stages/02-atomicity/fixed-with-transaction/create-payment-transaction.use-case.ts`  
Destino: `core/create-payment-with-transaction.use-case.ts` (pendiente).

## 7. Qué límite tenía esa solución

La TX solo protege datos locales. I/O externo dentro de la transacción mantiene locks abiertos demasiado tiempo.

## 8. Qué problema nuevo apareció

Transaction boundary: llamadas externas mal ubicadas (stage 03).
