# Stage 03 — Transaction boundary

## 1. Qué problema existía

La transacción DB envolvía una llamada externa simulada (~5 s) antes de descontar balance e insertar `payment`.

## 2. Cómo lo replicabas

**Roto:** `POST /payment-lab/stage-03/broken-external-inside-transaction/create-payment`  
**Corregido (intención):** `POST /payment-lab/stage-03/safer-boundary/create-payment`

```json
{
  "accountId": 1,
  "amount": 50000,
  "externalReference": "provider-payment-xyz"
}
```

Carga concurrente (k6: `stage-03-boundary.js` / `stage-03-safe-boundary.js`).

## 3. Qué daño causaba

Transacciones largas, locks en `account`, latencia alta, timeouts y agotamiento del pool de conexiones.

## 4. Por qué ocurría (causa raíz)

I/O externo o espera artificial dentro de `startTransaction` … `commitTransaction`.

## 5. Qué solución aplicaste

Ejecutar la llamada externa **antes** de `startTransaction`; la TX solo agrupa `UPDATE account` + `INSERT payment`.

## 6. Dónde está esa solución hoy (archivo en core/)

`stages/03-transaction-boundary/safer-boundary/create-payment-safe-boundary.use-case.ts`  
Destino: `core/create-payment-with-safe-boundary.use-case.ts` (pendiente).

## 7. Qué límite tenía esa solución

La TX sigue siendo solo local. El proveedor puede aprobar el cobro y la DB puede fallar después.

## 8. Qué problema nuevo apareció

External consistency: proveedor OK y base de datos sin registro (stage 04).
