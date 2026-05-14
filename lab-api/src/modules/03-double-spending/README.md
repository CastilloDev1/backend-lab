# Double Spending

## Fallo

Dos operaciones concurrentes gastan el mismo saldo “lógico” más de una vez.

## Daño

Balance incorrecto o movimientos registrados sin respaldo de fondos.

## Escenario 01: broken

**Endpoint:**  
`POST /double-spending/broken/pay`

**Body ejemplo:** `{ "walletId": 1, "amount": 100 }`

**Resultado esperado:**  
Read-modify-write en memoria + delay: dos pagos concurrentes pueden dejar el balance por debajo de lo que permitiría una suma serial de los mismos montos.

## Escenario 02: atomic balance update

**Endpoint:**  
`POST /double-spending/atomic-balance-update/pay`

**Body ejemplo:** `{ "walletId": 1, "amount": 100 }`

**Resultado esperado:**  
Un solo `UPDATE` con `WHERE balance >= amount` serializa el gasto; no hay doble gasto por condición de saldo.

## Escenario 03: transaction

**Endpoint:**  
`POST /double-spending/transaction/pay`

**Body ejemplo:** `{ "walletId": 1, "amount": 100 }`

**Resultado esperado:**  
Débito e inserción en `spend_ledger` ocurren en la misma transacción de base de datos: o ambos aplican o ninguno (no hay ledger huérfano sin débito).
