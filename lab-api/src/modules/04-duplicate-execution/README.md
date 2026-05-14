# Duplicate Execution

## Fallo

El usuario presiona pagar dos veces.

## Daño

Se crean dos `payment` para la misma intención de pago.

## Escenario 01: broken

**Endpoint:**  
`POST /duplicate-execution/broken/pay`

**Body ejemplo:** `{ "accountId": 1, "amount": 100 }`

**Resultado esperado:**  
2 requests => 2 payments (sin deduplicación por clave).

## Escenario 02: persistent idempotency

**Endpoint:**  
`POST /duplicate-execution/idempotency/pay`

**Body ejemplo:** `{ "accountId": 1, "amount": 100, "idempotenciaKey": "pay_abc" }`

**Resultado esperado:**  
2 requests con la misma key => 1 payment (replay devuelve el mismo resultado persistido).

## Escenario 03: crash after idempotency key

**Endpoint:**  
`POST /duplicate-execution/crash/pay`

**Body ejemplo:** `{ "accountId": 1, "amount": 100, "idempotenciaKey": "pay_crash" }`

**Resultado esperado:**  
La key queda en `PROCESSING` en la tabla de idempotencia, pero no se crea `payment` para ese intento (crash simulado antes del débito).

## Escenario 04: operation states

**Endpoint:**  
`POST /duplicate-execution/states/pay`

**Body ejemplo:** `{ "accountId": 1, "amount": 100, "operationKey": "op_states_1" }`

**Resultado esperado:**  
La operación pasa por estados en base de datos (`PENDING` → `PROCESSING` → `COMPLETED` o `FAILED`). La respuesta HTTP incluye `operationState: "COMPLETED"` cuando termina bien; reintentos con la misma `operationKey` devuelven replay de `COMPLETED`.
