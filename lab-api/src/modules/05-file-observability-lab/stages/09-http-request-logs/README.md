# Stage 09 — HTTP Request Logs

## Qué dejó resuelto el stage anterior

El Stage 08 introdujo búsqueda centralizada de logs con OpenSearch.

Ahora los logs estructurados de jobs ya no viven únicamente en stdout.

Podemos buscar y filtrar por:

- jobId
- fileName
- eventType
- status
- durationMs
- timestamp

Esto resolvió el dolor de investigar ejecuciones bajo volumen.

## Qué límite apareció

Ahora podemos observar los jobs.

Pero todavía no observamos las requests HTTP que originan esos jobs.

El sistema puede responder:

- Qué job inició.
- Qué job terminó.
- Cuánto duró el procesamiento.
- Qué archivo fue procesado.

Pero todavía no puede responder:

- Qué endpoint recibió la solicitud.
- Cuánto tardó la request HTTP.
- Qué status code devolvió.
- Qué método HTTP fue usado.
- Qué errores ocurrieron a nivel HTTP.
- Cuántas requests recibió el sistema.

## Qué vamos a cambiar en core/

Vamos a introducir HTTP Request Logs.

El sistema empezará a registrar información básica de cada request entrante.

Todavía no vamos a introducir:

- request_id
- correlation_id
- metrics
- tracing
- Prometheus
- Grafana
- OpenTelemetry
- alerting

La única responsabilidad nueva será registrar access logs de las requests HTTP.

## Qué debe quedar probado

Debe quedar probado que:

- Cada request HTTP genera un log estructurado.
- El log contiene method.
- El log contiene path.
- El log contiene statusCode.
- El log contiene durationMs.
- El log contiene timestamp.
- Los request logs llegan a OpenSearch.
- Podemos consultar requests lentas.
- Podemos filtrar requests por statusCode.

## Nueva lógica introducida

Se introduce el concepto de HTTP Request Logging.

Estos logs representan la entrada del sistema.

Los job logs explican el procesamiento interno.

Los request logs explican cómo el sistema fue llamado desde afuera.

Ambas señales son diferentes y complementarias.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El comportamiento funcional no cambia. |
| Concurrency | 🔴 Brecha | Aún no protegemos ejecuciones concurrentes del mismo job. |
| Resilience | 🟡 Parcial | Si OpenSearch falla, todavía puede afectar el flujo si el envío es bloqueante. |
| Recoverability | 🔴 Brecha | No hay recuperación automática de jobs atrapados. |
| Performance | 🟡 Parcial | Mediremos durationMs de requests, pero todavía no agregamos métricas. |
| Latency | 🟡 Parcial | Podremos detectar endpoints lentos individualmente. |
| Operational Complexity | 🟡 Media | Aparece una nueva señal transversal a todos los endpoints. |
| Cost | 🟡 Medio | Se indexará un log adicional por request. |
| Observability | 🟢 Mejorando | Ahora observamos tanto jobs como entrada HTTP. |
| Scalability | 🟡 Parcial | Mejoramos búsqueda, pero el envío sigue siendo directo desde la app. |

## Insight breve del sistema actual

Observar el job no es suficiente.

Un incidente normalmente empieza en la entrada del sistema:

- qué endpoint fue llamado
- cuánto tardó
- qué respondió

HTTP Request Logs conectan la experiencia externa con el comportamiento interno.

## Próximo problema

Aunque tendremos logs de requests y logs de jobs, todavía no existirá una forma automática de unirlos.

Podremos ver:

- POST /file-processing/jobs
- JOB_STARTED
- JOB_COMPLETED

Pero no sabremos con certeza qué request produjo qué job sin hacer inferencias manuales.

## Siguiente paso

Crear un interceptor HTTP que registre:

- method
- path
- statusCode
- durationMs
- timestamp

y envíe esos logs a OpenSearch.