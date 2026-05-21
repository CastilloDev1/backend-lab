# Stage 07 — Recover Stuck Events

## 1. Qué dejó resuelto el stage anterior

El worker puede procesar eventos correctamente:

PENDING → PROCESSING → PROCESSED

También puede manejar errores controlados:

PENDING → PROCESSING → FAILED

Se agregaron campos como:

- locked_at → cuándo fue tomado
- attempts → número de intentos
- last_error → último error

---

## 2. Qué límite apareció

Si el worker muere completamente después de marcar PROCESSING:

- el evento queda en PROCESSING
- no pasa a FAILED
- no vuelve a PENDING

Resultado:

evento muerto (nadie lo vuelve a procesar)

---

## 3. Qué vamos a cambiar en core/

Vamos a permitir recuperar eventos atascados.

Nueva regla:

Si un evento está en PROCESSING
y locked_at es muy antiguo

→ volverlo a PENDING

---

## 4. Qué debe quedar probado

Caso:

1. Evento pasa a PROCESSING
2. El worker falla antes de terminar
3. Se espera cierto tiempo
4. El sistema lo vuelve a PENDING
5. Otro worker lo procesa correctamente

---

## 5. Nueva lógica introducida

Ahora el sistema tiene capacidad de:

- detectar eventos “viejos”
- reintentarlos automáticamente

Esto se conoce como:

retry controlado

(retry = volver a intentar procesar algo que falló)

---

## 6. Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|----------|-------------|------------|
| Correctitud | Alta | No se pierden eventos |
| Resiliencia | Alta | Puede recuperarse de fallos |
| Performance | Media | Polling constante |
| Latencia | Media | Depende del tiempo de polling |
| Costo | Bajo | Solo PostgreSQL |
| Complejidad | Media-Alta | Estados + retry + control de tiempo |
| Escalabilidad | Limitada | Polling no escala bien |

---

## 7. Insight

El sistema ahora es capaz de recuperarse solo.

Pero introduce un nuevo riesgo:

un mismo evento puede ejecutarse más de una vez

---

## 8. Próximo problema

Retry ≠ seguro

Si reintentas sin control:

- puedes descontar balance dos veces
- puedes duplicar efectos

---

## 9. Siguiente paso

Idempotencia en el worker