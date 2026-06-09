# Stage 06 — Structured Logs

## Qué dejó resuelto el stage anterior

El Stage 05 introdujo logs operacionales.

Ahora el sistema puede mostrar actividad mientras el job se ejecuta.

Ejemplos:

- JOB_STARTED
- JOB_COMPLETED
- JOB_FAILED

Esto permite observar en consola qué está ocurriendo sin consultar PostgreSQL.

## Qué límite apareció

Los logs actuales son texto libre.

Funcionan con pocos jobs, pero empiezan a fallar cuando aumenta el volumen.

Problemas:

- Es difícil buscar por jobId.
- Es difícil filtrar por eventType.
- Es difícil extraer durationMs.
- Es difícil agrupar errores.
- Es difícil procesarlos con herramientas externas.

La información existe, pero no tiene estructura.

## Qué vamos a cambiar en core/

Vamos a cambiar los logs operacionales a formato estructurado.

Cada log emitirá información como objeto.

Todavía no vamos a introducir:

- Elastic
- Datadog
- Grafana
- Prometheus
- OpenTelemetry
- Correlation IDs
- Metrics
- Tracing

La única responsabilidad nueva será hacer que los logs sean legibles por máquinas.

## Qué debe quedar probado

Debe quedar probado que:

- El inicio de un job genera un log estructurado.
- La finalización de un job genera un log estructurado.
- Los errores generan un log estructurado.
- Cada log contiene jobId.
- Cada log contiene eventType.
- Cada log contiene fileName.
- Los logs de finalización contienen durationMs.
- Los logs de error contienen error.

## Nueva lógica introducida

Se introduce Structured Logging.

Un log deja de ser solo texto humano y pasa a representar un evento operacional con campos claros.

Ejemplo conceptual:

- eventType
- jobId
- fileName
- status
- durationMs
- error

Esto prepara el sistema para búsqueda, filtrado, agregación y herramientas externas más adelante.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El flujo funciona, pero todavía no procesa archivos reales. |
| Concurrency | 🔴 Brecha | No existe protección contra ejecuciones simultáneas del mismo job. |
| Resilience | 🔴 Brecha | Un job puede quedar atrapado en PROCESSING. |
| Recoverability | 🔴 Brecha | No existe recuperación automática. |
| Performance | 🟡 Parcial | La estructura del log agrega costo mínimo. |
| Latency | 🟡 Parcial | Podemos registrar duración, pero aún no analizamos distribución de latencias. |
| Operational Complexity | 🟡 Media | Los logs son más útiles, pero requieren disciplina de campos. |
| Cost | 🟢 Bajo | No se agrega infraestructura externa. |
| Observability | 🟡 Parcial | Los logs empiezan a ser consultables y procesables. |
| Scalability | 🔴 Brecha | La salida sigue siendo consola local. |

## Insight breve del sistema actual

Un log en texto responde:

¿Qué dice el sistema?

Un log estructurado responde:

¿Qué campo quiero buscar, filtrar o agrupar?

La estructura es el primer paso para que los logs puedan escalar.

## Próximo problema

Aunque los logs estarán estructurados, todavía vivirán en la consola del proceso.

Si el proceso reinicia, si hay múltiples instancias o si queremos buscar históricamente, la consola no será suficiente.

## Siguiente paso

Modificar el logger operacional para emitir logs estructurados con campos consistentes:

- eventType
- jobId
- fileName
- status
- durationMs
- error