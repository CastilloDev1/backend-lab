# Stage 07 — Log Volume Pressure

## Qué dejó resuelto el stage anterior

El Stage 06 introdujo Structured Logs.

Ahora los logs ya no son solo texto libre.

Cada ejecución puede emitir campos como:

- eventType
- jobId
- fileName
- status
- durationMs
- error

Esto hace que los logs sean más fáciles de interpretar y preparar para herramientas futuras.

## Qué límite apareció

Aunque los logs ya tienen estructura, todavía viven en stdout.

Con pocos jobs esto funciona.

Pero no sabemos qué ocurre cuando el sistema genera alto volumen de logs.

Antes de introducir una herramienta de búsqueda o centralización, necesitamos demostrar el dolor real.

## Qué vamos a cambiar en core/

No vamos a cambiar core todavía.

Vamos a introducir una prueba de carga con k6 para generar muchas ejecuciones de jobs.

El objetivo no es mejorar performance.

El objetivo es saturar la salida operacional y observar si stdout sigue siendo útil.

No vamos a introducir:

- Elastic
- OpenSearch
- Grafana
- Prometheus
- OpenTelemetry
- Tracing
- Metrics

La única responsabilidad nueva será provocar volumen operacional.

## Qué debe quedar probado

Debe quedar probado que:

- Podemos crear muchos jobs.
- Podemos procesar muchos jobs.
- El sistema genera muchos logs estructurados.
- stdout se vuelve difícil de leer.
- Buscar un job específico en consola se vuelve incómodo.
- La necesidad de centralizar logs aparece de forma natural.

## Nueva lógica introducida

Se introduce una prueba de presión operacional con k6.

Esta prueba no mide únicamente throughput.

También fuerza volumen de señales.

El foco del stage es observar el comportamiento del sistema cuando los logs dejan de ser pocos y pasan a ser muchos.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El flujo funciona, pero la prueba puede exponer fallos por volumen. |
| Concurrency | 🔴 Brecha | No estamos protegiendo todavía ejecuciones concurrentes del mismo job. |
| Resilience | 🔴 Brecha | Si algo falla bajo carga, no hay recovery automático. |
| Recoverability | 🔴 Brecha | Los jobs fallidos o atrapados requieren revisión manual. |
| Performance | 🟡 Parcial | k6 permitirá observar comportamiento bajo presión. |
| Latency | 🟡 Parcial | Podremos ver si el endpoint mantiene tiempos razonables. |
| Operational Complexity | 🟡 Media | Aparece dificultad para interpretar logs bajo volumen. |
| Cost | 🟢 Bajo | No se agrega infraestructura nueva. |
| Observability | 🟡 Parcial | Hay señales estructuradas, pero no hay búsqueda ni centralización. |
| Scalability | 🔴 Brecha | stdout no escala como mecanismo de análisis operacional. |

## Insight breve del sistema actual

Un log útil en bajo volumen puede convertirse en ruido en alto volumen.

La observabilidad no solo depende de generar señales.

También depende de poder consumirlas cuando el sistema está bajo presión.

## Próximo problema

Después de generar cientos o miles de logs, la consola dejará de ser suficiente.

Necesitaremos responder:

- ¿Cómo busco un job específico?
- ¿Cómo filtro solo errores?
- ¿Cómo encuentro jobs lentos?
- ¿Cómo consulto logs históricos?
- ¿Cómo observo múltiples instancias?

## Siguiente paso

Crear un script k6 que:

- Cree jobs.
- Procese jobs.
- Genere volumen de logs.
- Permita ejecutar 1000 iteraciones.
- Exponga el límite real de stdout.