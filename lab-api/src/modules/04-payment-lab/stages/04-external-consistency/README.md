# Stage 04 — External consistency

## 1. Qué problema existía

El proveedor aprueba el pago y la persistencia local falla: cobro externo sin registro en DB.

## 2. Cómo lo replicabas

**Roto (use case, sin endpoint HTTP):** `broken-provider-ok-db-fails/create-payment-provider-ok-db-fails.use-case.ts`  
**Outbox preview:** `POST /payment-lab/stage-04/fixed-with-outbox-preview/create-payment`

```json
{
  "accountId": 1,
  "amount": 50000,
  "externalReference": "provider-payment-001"
}
```

k6: `k6/payment-lab/stage-04-fix-with-outbox.js`

## 3. Qué daño causaba

Cobro en el proveedor sin `payment` local; reintentos arriesgados y sin reconciliación.

## 4. Por qué ocurría (causa raíz)

Efecto externo irreversible antes de confirmar el estado local, sin compensación ni registro de intención.

## 5. Qué solución aplicaste

Outbox (preview): en la misma transacción, `INSERT payment` + `INSERT outbox_event` (`PAYMENT_CREATED`, `PENDING`). El worker consume el evento tras el `COMMIT`.

## 6. Dónde está esa solución hoy (archivo en core/)

`stages/04-external-consistency/fixed-with-outbox-preview/create-payment-outbox-preview.use-case.ts`  
Destino: `core/create-payment-with-outbox.use-case.ts` (pendiente).

## 7. Qué límite tenía esa solución

El proveedor no se llama en este preview. Sin outbox processor, los eventos quedan en `PENDING`.

## 8. Qué problema nuevo apareció

Procesamiento asíncrono del outbox: worker, reintentos e idempotencia en el consumer (stage 05).
