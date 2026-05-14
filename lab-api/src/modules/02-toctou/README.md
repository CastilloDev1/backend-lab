# TOCTOU (Time-of-check to time-of-use)

## Fallo

Entre comprobar una condición y usar el recurso, otro hilo cambia el estado: la decisión queda invalidada.

## Daño

Se consume más recurso del permitido (por ejemplo créditos negativos o doble uso lógico).

## Escenario 01: broken

**Endpoint:**  
`POST /toctou/broken/consume`

**Body ejemplo:** `{ "resourceId": 1, "amount": 1 }` (por defecto `resourceId` 1 y `amount` 1)

**Resultado esperado:**  
Con dos requests concurrentes y delay, ambos pueden pasar el check en memoria y dejar `creditsRemaining` inconsistente respecto a la política “solo N consumos”.

## Escenario 02: conditional update

**Endpoint:**  
`POST /toctou/conditional-update/consume`

**Body ejemplo:** `{ "resourceId": 1, "amount": 1 }`

**Resultado esperado:**  
El consumo depende de un único `UPDATE ... WHERE credits >= :amount`; si no hay filas actualizadas, el segundo request falla sin corromper el invariante.
