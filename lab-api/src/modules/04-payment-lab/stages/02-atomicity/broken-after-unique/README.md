# Stage 02 — Atomicity (Broken after UNIQUE)

## 1. Nombre del fallo

Operación parcial después de aplicar UNIQUE

---

## 2. Categoría

Atomicidad

---

## 3. Historia humana

Fabián ya implementó una protección contra pagos duplicados usando una restricción UNIQUE sobre `external_reference`.

El proveedor de pagos envía el mismo request dos veces.

El sistema ahora:

- evita crear un segundo payment
- pero sigue ejecutando la lógica previa

---

## 4. Qué se rompe

El flujo actual es:

1. descontar balance de la cuenta
2. intentar crear el payment

Cuando llega el segundo request:

- el balance se descuenta
- el INSERT falla por UNIQUE

Resultado:

- el dinero se descuenta
- pero no existe el segundo payment

---

## 5. Daño real

- el cliente pierde dinero
- no hay registro del segundo cobro
- inconsistencia financiera
- pérdida de trazabilidad

---

## 6. Por qué se rompe

Porque las operaciones son independientes:

- UPDATE account
- INSERT payment

No existe una transacción que las agrupe.

La base de datos ejecuta cada instrucción por separado.

---

## 7. Cómo replicarlo

Usar el endpoint:

POST /payment-lab/stage-01/fixed-with-unique/payments

Enviar dos veces el mismo request:

- mismo accountId
- mismo amount
- mismo externalReference

---

## 8. Resultado esperado

Primer request:

- balance descontado
- payment creado

Segundo request:

- balance descontado
- error por UNIQUE
- no se crea payment

---

## 9. Qué aprendimos

- UNIQUE protege contra duplicados
- pero NO protege la consistencia de múltiples operaciones
- el orden de ejecución importa
- el sistema puede fallar a mitad del flujo

---

## 10. Qué NO soluciona UNIQUE

UNIQUE NO garantiza:

- que varias operaciones ocurran juntas
- que el sistema no quede en estado intermedio
- que un fallo revierta cambios anteriores

---

## 11. Insight clave

Una operación de negocio no es una sola query.

Es un conjunto de cambios que deben comportarse como una unidad.

---

## 12. Siguiente problema

Atomicidad completa

Necesitamos garantizar que:

- o se descuenta balance y se crea el payment
- o no ocurre ninguno de los dos

---

## 13. Siguiente solución

Transacciones en PostgreSQL

- BEGIN
- COMMIT
- ROLLBACK