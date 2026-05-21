# Stage 08 — Idempotency in Worker

## 1. Qué dejó resuelto el stage anterior

El sistema puede:

- recuperar eventos atascados
- reintentarlos automáticamente

`PROCESSING → PENDING → retry`

---

## 2. Qué límite apareció

El retry puede ejecutar el mismo evento más de una vez.

Caso real:

1. Worker toma evento
2. Descuenta balance
3. Falla antes de marcar PROCESSED
4. Recovery lo devuelve a PENDING
5. Otro worker lo ejecuta otra vez

Resultado:

doble descuento

---

## 3. Qué vamos a cambiar en core/

Hacer el procesamiento idempotente.

Nueva regla:

Un evento solo puede aplicar su efecto una vez,
aunque se ejecute múltiples veces.

---

## 4. Qué debe quedar probado

Caso:

- Evento se ejecuta 2 veces
- El balance solo se descuenta una vez
- El evento termina en PROCESSED

---

## 5. Cómo lo logramos

Crear tabla:

`payment_lab_processed_events`

Y usar:

`UNIQUE(outbox_event_id)`

Flujo:

- intento registrar evento como procesado
- si es primera vez → aplico efecto
- si ya existe → NO aplico efecto

---

## 6. Evaluación de la solución actual

| Variable | Estado | Explicación |
|----------|--------|------------|
| Correctitud | Alta | Evita doble ejecución |
| Resiliencia | Alta | Retry seguro |
| Performance | Media | Más escritura en DB |
| Latencia | Media | Igual que antes |
| Costo | Bajo | Solo PostgreSQL |
| Complejidad | Alta | Más tablas y lógica |
| Escalabilidad | Limitada | Polling sigue siendo cuello |

---

## 6.1 Evaluación del sistema completo

| Variable | Estado global | Explicación |
|----------|-------------|------------|
| Correctitud | Alta | No hay duplicados ni pérdida de eventos |
| Resiliencia | Alta | Puede recuperarse de fallos y reintentar |
| Performance | Media | Polling y múltiples queries |
| Latencia | Media | No es inmediato (worker + polling) |
| Costo | Bajo | Solo PostgreSQL |
| Complejidad | Alta | Estados + outbox + retries + idempotencia |
| Escalabilidad | Limitada | PostgreSQL está haciendo demasiadas responsabilidades |

---

## 7. Insight

Retry sin idempotencia rompe el sistema.

Idempotencia permite reintentar sin miedo.

---

## 8. Próximo problema

La base de datos empieza a manejar demasiada lógica:

- cola
- retries
- idempotencia
- estado

Se acerca un límite de escalabilidad y diseño.