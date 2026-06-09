# Stage 04 — Execution Events

## Qué dejó resuelto el stage anterior

El Stage 03 introdujo el seguimiento temporal del ciclo de vida de un job.

Ahora el sistema puede responder:

- ¿Cuándo comenzó?
- ¿Cuándo terminó?
- ¿Cuánto tardó?

Los jobs ahora poseen:

- started_at
- completed_at
- duration_ms

Esto permitió introducir la primera señal operacional persistida.

## Qué límite apareció

Aunque ahora conocemos la duración de un job, seguimos sin entender qué ocurrió durante su ejecución.

Podemos detectar que un job tardó 48 segundos.

Pero todavía no podemos responder:

- ¿Qué hizo durante esos 48 segundos?
- ¿Qué paso estaba ejecutando?
- ¿En qué punto falló?
- ¿Hasta dónde avanzó?
- ¿Qué ocurrió antes del error?

La duración explica cuándo ocurrió algo.

No explica qué ocurrió.

## Qué vamos a cambiar en core/

Vamos a introducir el concepto de eventos de ejecución.

Cada job comenzará a registrar hitos importantes de su ciclo de vida.

Estos eventos formarán una historia persistida que podrá ser consultada posteriormente.

Todavía no vamos a utilizar logs.

Todavía no vamos a utilizar métricas.

Todavía no vamos a utilizar tracing.

Todavía no vamos a utilizar dashboards.

La única responsabilidad nueva será registrar eventos operacionales persistentes.

## Qué debe quedar probado

Debe quedar probado que:

- Un job registra su inicio.
- Un job registra su finalización exitosa.
- Un job registra sus errores.
- Los eventos quedan asociados al job.
- Podemos reconstruir la secuencia de ejecución después de que el proceso termine.

## Nueva lógica introducida

Se introduce una nueva entidad operacional:

job_execution_events

Cada evento representa un hecho ocurrido durante la vida de un job.

Ejemplos:

- JOB_STARTED
- VALIDATION_STARTED
- VALIDATION_COMPLETED
- PARSING_STARTED
- PARSING_COMPLETED
- JOB_COMPLETED
- JOB_FAILED

El objetivo no es observar todavía.

El objetivo es generar una historia persistida.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El sistema continúa siendo funcional pero todavía no procesa archivos reales. |
| Concurrency | 🔴 Brecha | No existe control sobre ejecuciones concurrentes. |
| Resilience | 🔴 Brecha | Un job aún puede quedar atrapado en PROCESSING. |
| Recoverability | 🔴 Brecha | No existen mecanismos de recuperación. |
| Performance | 🟡 Parcial | Ya conocemos la duración total del job. |
| Latency | 🟡 Parcial | Podemos identificar jobs lentos, pero no explicar el motivo. |
| Operational Complexity | 🟢 Baja | La complejidad sigue siendo reducida. |
| Cost | 🟢 Bajo | Solo se agrega persistencia adicional. |
| Observability | 🟡 Parcial | Comienza a existir una historia operacional persistida. |
| Scalability | 🔴 Brecha | El procesamiento sigue siendo manual. |

## Insight breve del sistema actual

Saber cuánto tardó una operación es útil.

Saber qué ocurrió durante ese tiempo es mucho más valioso.

La observabilidad comienza cuando podemos reconstruir la historia de una ejecución.

## Próximo problema

Cuando existan cientos o miles de eventos:

- Será difícil encontrarlos.
- Será difícil agruparlos.
- Será difícil seguir la historia completa de una operación.

La información existirá.

Encontrarla será el nuevo problema.

## Siguiente paso

Introducir:

- entidad job_execution_events
- registro automático de eventos
- asociación entre eventos y jobs
- consulta de historia de ejecución