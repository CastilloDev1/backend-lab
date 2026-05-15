# Stage 01 — Duplicate Execution (Fixed with UNIQUE)

## 1. Nombre del fallo

Duplicate Execution

---

## 2. Solución aplicada

Se agregó una restricción UNIQUE en PostgreSQL sobre el campo `external_reference`.

---

### Implementacion

```sql
ALTER TABLE payment
ADD CONSTRAINT unique_external_reference
UNIQUE (external_reference);
```

---

## 3. Qué problema protege

Evita que existan dos pagos con la misma referencia externa.

Si dos requests intentan insertar el mismo `external_reference`:

- uno se guarda correctamente
- el otro falla automáticamente

---

## 4. Por qué es la PRIMERA línea de defensa

PostgreSQL garantiza la unicidad de forma atómica.

Esto significa que incluso si dos requests llegan al mismo tiempo:

- la base de datos decide cuál gana
- el otro es rechazado

Esto no depende del backend.

---

## 5. Qué pasaría si NO existiera

Dos requests concurrentes podrían:

- leer que no existe el pago
- ambos insertar

Resultado:

- duplicidad real
- doble cobro

---

## 6. Por qué es mejor que validarlo en Node.js

Validar primero en Node.js y luego insertar es inseguro.

Problema:

- Request A revisa y ve que no existe
- Request B revisa y ve que no existe
- ambos insertan

Esto es un caso clásico de TOCTOU.

PostgreSQL con UNIQUE evita esto completamente.

---

## 7. Nueva prueba

Enviar dos requests iguales con el mismo:

- `accountId`
- `amount`
- `externalReference`

Resultado esperado:

- Primer request: OK
- Segundo request: error `23505` o respuesta `409 Conflict`

---

## 8. Qué aprendimos

- La base de datos debe proteger reglas críticas del negocio.
- UNIQUE no es un detalle técnico; es parte del mecanismo.
- Node.js no puede garantizar unicidad bajo concurrencia.
- PostgreSQL sí puede hacerlo de forma atómica.

---

## 9. Límite de esta solución

El flujo sigue siendo peligroso si primero se descuenta el balance y después se intenta crear el pago.

Resultado posible:

- El balance se descuenta.
- El pago no se crea porque UNIQUE rechaza el duplicado.

Esto genera inconsistencia en el sistema.

---

## 10. Siguiente problema

Atomicidad.

Ahora el problema es:

- la operación puede fallar a mitad del flujo.

Se necesita garantizar:

- o todo ocurre
- o nada ocurre.