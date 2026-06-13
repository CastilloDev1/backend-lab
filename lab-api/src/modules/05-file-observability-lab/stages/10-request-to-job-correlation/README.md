# Stage 10 — Request To Job Correlation

## Qué dejó resuelto el stage anterior

El Stage 09 introdujo HTTP Request Logs.

Ahora el sistema registra:

- method
- path
- statusCode
- durationMs
- timestamp

Estos logs son enviados a OpenSearch y permiten observar la entrada del sistema.

También seguimos registrando:

- JOB_STARTED
- JOB_COMPLETED
- JOB_FAILED

como logs operacionales del procesamiento.

## Qué límite apareció

Ahora tenemos dos fuentes de información:

- HTTP Request Logs
- Job Logs

Ambas son útiles por separado.

Pero todavía no existe una forma sencilla de relacionarlas.

Actualmente podemos responder:

- Qué request ocurrió.
- Qué job ocurrió.

Pero no podemos responder:

- Qué request creó este job.
- Qué job nació de esta request.
- Qué ocurrió durante una operación completa.
- Cómo seguir una ejecución desde la entrada hasta la finalización.

Las señales existen.

Pero permanecen aisladas.

## Qué vamos a cambiar en core/

Vamos a introducir un identificador de request.

Ese identificador será propagado desde la request HTTP hacia el job.

Posteriormente será registrado en los logs.

Todavía no vamos a introducir:

- Correlation IDs distribuidos
- OpenTelemetry
- Tracing
- Metrics
- Prometheus
- Grafana
- Alerting

La única responsabilidad nueva será conectar request logs y job logs.

## Qué debe quedar probado

Debe quedar probado que:

- Cada request recibe un requestId.
- El requestId es persistido en el job.
- El requestId aparece en los logs HTTP.
- El requestId aparece en los logs del job.
- Podemos buscar un requestId en OpenSearch.
- Podemos reconstruir una operación completa usando un único identificador.

## Nueva lógica introducida

Se introduce Request Correlation.

Nuevo dato:

- requestId

Este identificador permite conectar:

Request
↓
Job
↓
Execution Events
↓
Operational Logs

La operación comienza a convertirse en una unidad observable.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El flujo funcional sigue siendo el mismo. |
| Concurrency | 🔴 Brecha | No existe protección contra procesamiento concurrente. |
| Resilience | 🟡 Parcial | La observabilidad mejora, pero OpenSearch sigue siendo una dependencia adicional. |
| Recoverability | 🔴 Brecha | No existe recuperación automática. |
| Performance | 🟡 Parcial | Se agregará metadata adicional a cada operación. |
| Latency | 🟡 Parcial | Seguimos observando tiempos individuales. |
| Operational Complexity | 🟡 Media | Comienza la propagación de contexto operacional. |
| Cost | 🟡 Medio | Se indexan más campos en OpenSearch. |
| Observability | 🟢 Mejorando | Las señales dejan de estar aisladas. |
| Scalability | 🟡 Parcial | La correlación mejora la investigación, pero no la agregación. |

## Insight breve del sistema actual

Observar componentes individuales es útil.

Observar una operación completa es mucho más poderoso.

La correlación permite seguir una historia completa sin depender de múltiples búsquedas independientes.

## Próximo problema

Aunque podremos seguir una operación específica:

- Seguiremos sin conocer tendencias.
- Seguiremos sin conocer tasas.
- Seguiremos sin conocer volúmenes.
- Seguiremos sin conocer distribuciones.

Podremos responder:

"qué pasó"

Pero todavía no:

"cuánto está pasando"

## Siguiente paso

Introducir:

- requestId
- propagación hacia jobs
- persistencia del requestId
- request logs correlacionados
- job logs correlacionados

para reconstruir operaciones completas dentro de OpenSearch.