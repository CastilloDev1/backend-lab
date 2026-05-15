# Stage 01 — Duplicate Execution (Broken)

## 1. Nombre del fallo

Duplicate Execution

---

## 2. Historia humana

Fabián integra un proveedor de pagos.

El proveedor envía una operación con:

externalReference = "provider-payment-001"

Por un retry del proveedor o doble click del usuario, el backend recibe el mismo request dos veces.

El sistema no reconoce que ambas requests representan la misma operación.

---

## 3. Qué se rompe

Se crean dos pagos con la misma referencia.

El balance de la cuenta se descuenta dos veces.

Resultado:

- El cliente paga dos veces
- El sistema cree que son dos pagos distintos

---

## 4. Por qué se rompe

La base de datos permite múltiples filas con el mismo external_reference.

No existe ninguna restricción que garantice unicidad.

El backend tampoco valida duplicados.

---

## 5. Cómo replicarlo

Hacer dos requests iguales:

POST /payment-lab/stage-01/broken/payments

```json
{
  "accountId": 1,
  "amount": 50000,
  "externalReference": "provider-payment-001"
}