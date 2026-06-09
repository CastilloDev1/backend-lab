# Stage 05 — Operational Logs

## Qué dejó resuelto el stage anterior

El Stage 04 introdujo eventos de ejecución persistidos.

Ahora cada job puede construir una historia operacional mediante eventos almacenados en PostgreSQL.

Ejemplo:

- JOB_STARTED
- JOB_COMPLETED
- JOB_FAILED

Esto permite reconstruir una ejecución incluso después de que el proceso haya terminado.

## Qué límite apareció

La información existe.

Pero observarla sigue siendo costoso.

Para entender qué está ocurriendo debemos consultar manualmente PostgreSQL.

A medida que aumenta el volumen de jobs y eventos:

- Las consultas se vuelven más frecuentes.
- La investigación operacional se vuelve más lenta.
- La detección de problemas se vuelve reactiva.

El sistema posee historia.

Pero no posee visibilidad en tiempo real.

## Qué vamos a cambiar en core/

Vamos a introducir logs operacionales.

El sistema comenzará a emitir mensajes durante la ejecución de un job.

Estos mensajes estarán orientados a observación humana.

Todavía no vamos a introducir:

- Structured Logging
- Correlation IDs
- Metrics
- Tracing
- Dashboards
- Alerting

La única responsabilidad nueva será exponer actividad operacional mientras ocurre.

## Qué debe quedar probado

Debe quedar probado que:

- El inicio de un job genera un log.
- La finalización de un job genera un log.
- Los errores generan un log.
- La información aparece durante la ejecución.
- Podemos seguir una ejecución observando únicamente la consola.

## Nueva lógica introducida

Se introduce el concepto de Operational Logging.

Los logs representan señales operacionales en tiempo real.

Ejemplos:

- Job execution started
- Job execution completed
- Job execution failed

Los logs no reemplazan los eventos persistidos.

Ambos mecanismos tienen responsabilidades distintas.

Eventos:

- Historia persistente.

Logs:

- Visibilidad inmediata.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El flujo sigue siendo funcional pero todavía no procesa archivos reales. |
| Concurrency | 🔴 Brecha | No existe protección contra múltiples ejecuciones simultáneas. |
| Resilience | 🔴 Brecha | Los jobs pueden quedar atrapados en PROCESSING. |
| Recoverability | 🔴 Brecha | No existe recuperación automática. |
| Performance | 🟡 Parcial | Ya conocemos duración total de ejecución. |
| Latency | 🟡 Parcial | Podemos detectar lentitud, pero no analizarla profundamente. |
| Operational Complexity | 🟡 Media | Aparece una nueva fuente de información operacional. |
| Cost | 🟢 Bajo | Solo se generan mensajes de ejecución. |
| Observability | 🟡 Parcial | Ahora podremos observar actividad mientras ocurre. |
| Scalability | 🔴 Brecha | El procesamiento sigue siendo manual. |

## Insight breve del sistema actual

Los eventos permiten responder:

¿Qué ocurrió?

Los logs permiten responder:

¿Qué está ocurriendo ahora mismo?

Ambos son necesarios.

Pero resuelven problemas diferentes.

## Próximo problema

A medida que aumente el volumen de logs:

- Será difícil seguir una ejecución específica.
- Será difícil diferenciar jobs.
- Será difícil buscar información relevante.

La información existirá.

Pero estará desordenada.

## Siguiente paso

Introducir un componente de logging operacional capaz de emitir:

- Inicio de ejecución
- Finalización de ejecución
- Errores de ejecución

y conectarlo al flujo actual de procesamiento de jobs.