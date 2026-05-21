# Stage 06 — Stuck Processing Event

## 1. Qué dejó resuelto el stage anterior

El worker ya puede tomar eventos `PENDING` desde la outbox y procesarlos.

El flujo actual es:

`PENDING → PROCESSING → PROCESSED`

Esto evita que dos workers procesen el mismo evento al mismo tiempo.

---

## 2. Qué límite apareció

Si el worker toma un evento y se cae antes de terminar, el evento queda en:

`PROCESSING`

Ese evento ya no será tomado por otro worker porque dejó de estar `PENDING`.

Resultado:

- evento atorado
- pago pendiente sin terminar
- pérdida de progreso operacional

---

## 3. Qué vamos a cambiar en `core/`

Agregar metadata mínima al outbox:

- `locked_at`
- `attempts`
- `last_error`

Y actualizar el worker para:

- registrar cuándo toma un evento
- incrementar intentos
- guardar error si falla
- marcar `FAILED` cuando el procesamiento falla controladamente

---

## 4. Qué debe quedar probado

Caso exitoso:

`PENDING → PROCESSING → PROCESSED`

Caso con error controlado:

`PENDING → PROCESSING → FAILED`

Y debe quedar registrado:

- número de intentos
- último error
- fecha en que fue tomado

---

## 5. Nuevo límite

Si el proceso muere completamente después de marcar `PROCESSING`, no alcanza a marcar `FAILED`.

El evento puede quedar atorado igual.

Siguiente problema:

recuperar eventos viejos en `PROCESSING`.

## 6. Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|----------|-------------|------------|
| Correctitud | Alta | No se pierden eventos porque están en DB |
| Resiliencia | Media | Puede fallar y dejar eventos en PROCESSING |
| Performance | Media | Uso de polling (revisión periódica) |
| Latencia | Media | No es inmediato, depende del polling |
| Costo | Bajo | Solo PostgreSQL |
| Complejidad | Media | Estados + worker |
| Escalabilidad | Limitada | Polling no escala bien con muchos eventos |

---

## 7. Insight

La solución es correcta en términos de datos,
pero empieza a fallar en resiliencia y escalabilidad.

---

## 8. Próximo paso

Recuperar eventos atascados (retry controlado).