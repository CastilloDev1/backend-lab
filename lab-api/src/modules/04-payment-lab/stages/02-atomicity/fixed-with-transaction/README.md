# Stage 02 — Atomicity (Fixed with Transaction)

## 1. Nombre del fallo

Operación parcial después de aplicar UNIQUE

---

## 2. Solución aplicada

Se implementó una transacción en PostgreSQL para agrupar las operaciones:

- descontar balance
- crear el payment

Ahora ambas operaciones se ejecutan como una sola unidad.

---

## 3. Qué problema protege

Evita que el sistema quede en un estado inconsistente cuando ocurre un error a mitad del flujo.

Ahora:

- si el payment se crea → el balance se descuenta
- si el payment falla → el balance NO se descuenta

---

## 4. Cómo funciona

Se agrupan las operaciones dentro de una transacción:

- inicio de transacción
- ejecución de múltiples queries
- confirmación (commit) si todo sale bien
- reversión (rollback) si ocurre un error

Esto garantiza comportamiento tipo:

todo o nada

---

## 5. Nueva prueba

Enviar dos requests iguales:

- mismo accountId
- mismo amount
- mismo externalReference

Resultado esperado:

Primer request:

- balance descontado
- payment creado

Segundo request:

- error por duplicado (UNIQUE)
- balance NO se descuenta

---

## 6. Qué aprendimos

- una operación de negocio puede involucrar múltiples cambios
- esos cambios deben ejecutarse como una sola unidad
- PostgreSQL permite agruparlos mediante transacciones
- UNIQUE y TRANSACTION resuelven problemas distintos y complementarios

---

## 7. Qué problema soluciona cada cosa

- UNIQUE → evita duplicados
- TRANSACTION → evita operaciones parciales

---

## 8. Qué pasaría sin transacción

El sistema puede:

- descontar dinero
- fallar al crear el payment
- quedar inconsistente

---

## 9. Límite de esta solución

Aunque la transacción protege la consistencia interna, todavía existe un problema:

La transacción incluye toda la lógica del pago.

Si dentro de la transacción ocurre algo externo (por ejemplo, un proveedor de pagos):

- la transacción puede tardar demasiado
- puede bloquear recursos en la base de datos
- puede afectar la concurrencia del sistema

---

## 10. Insight clave

Las transacciones son ideales para proteger datos dentro de la base de datos.

Pero no deben abarcar operaciones externas o de larga duración.

---

## 11. Siguiente problema

Definir correctamente los límites de la transacción.

---

## 12. Siguiente solución

Separar la operación en partes:

- lo que debe ser transaccional (base de datos)
- lo que debe ejecutarse fuera de la transacción

Esto lleva al siguiente tema:

transaction boundary y manejo de operaciones externas.