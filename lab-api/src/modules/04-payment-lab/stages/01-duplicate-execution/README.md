# Stage 01 — Duplicate execution

## 1. Qué problema existía

Dos requests con el mismo `externalReference` creaban dos pagos y descontaban el balance dos veces.

## 2. Cómo lo replicabas

**Roto:** `POST /payment-lab/stage-01/broken/create-payment`  
**Con UNIQUE:** `POST /payment-lab/stage-01/unique/create-payment`

```json
{
  "accountId": 1,
  "amount": 50000,
  "externalReference": "provider-payment-001"
}
```

Mismo body dos veces (k6: `k6/payment-lab/stage-01-broken.js` / `stage-01-unique.js`).

## 3. Qué daño causaba

Doble cobro, dos filas en `payment` con la misma referencia externa.

## 4. Por qué ocurría (causa raíz)

Sin restricción `UNIQUE` en `external_reference`. Validar en Node antes del `INSERT` no es seguro bajo concurrencia (TOCTOU).

## 5. Qué solución aplicaste

`UNIQUE` en `external_reference`. El segundo `INSERT` falla (`23505`) y el API responde `409 Conflict`.

## 6. Dónde está esa solución hoy (archivo en core/)

`stages/01-duplicate-execution/fixed-with-unique/create-payment-unique.use-case.ts`  
Destino: restricción en esquema + `core/create-payment.use-case.ts` (pendiente).

## 7. Qué límite tenía esa solución

El flujo hace `UPDATE account` y luego `INSERT payment`. Si el `INSERT` falla por `UNIQUE`, el descuento no se revierte.

## 8. Qué problema nuevo apareció

Operación parcial: balance descontado sin `payment` (stage 02 — atomicidad).
