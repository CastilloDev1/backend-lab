# Stage 01 — Blind File Processing

## Qué dejó resuelto el stage anterior

No existe stage anterior.

Este stage inicia un nuevo laboratorio enfocado en observabilidad.

El sistema todavía no busca ser observable. Primero necesitamos construir un flujo funcional pero ciego, donde el problema aparezca de forma natural.

## Qué límite apareció

Actualmente no existe ningún flujo que permita observar un problema real.

Antes de introducir logs, métricas, tracing o dashboards, necesitamos un proceso backend que pueda fallar, tardar o quedar ambiguo.

## Qué vamos a cambiar en core/

Solo vamos a crear el flujo mínimo para recibir un archivo CSV y registrar una operación de procesamiento.

No vamos a procesar el archivo completamente todavía.

No vamos a usar colas.

No vamos a usar workers.

No vamos a usar Prometheus.

No vamos a usar Grafana.

No vamos a usar OpenTelemetry.

## Qué debe quedar probado

Debe quedar probado que:

- El sistema recibe una solicitud de carga de archivo.
- El sistema crea un registro de procesamiento.
- El sistema responde que el archivo fue aceptado.
- El estado inicial queda registrado como PENDING.
- Todavía no sabemos qué pasará después con ese archivo.

## Nueva lógica introducida

Se introduce el concepto de:

- File Processing Job
- Estado inicial PENDING
- Flujo mínimo de aceptación

Este stage NO procesa datos todavía.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El sistema acepta archivos, pero todavía no valida contenido ni procesa registros. |
| Concurrency | 🔴 Brecha | No existe procesamiento concurrente todavía. |
| Resilience | 🔴 Brecha | Si algo falla después de aceptar el archivo, no hay recuperación. |
| Recoverability | 🔴 Brecha | No existe mecanismo para reintentar ni reconstruir el flujo. |
| Performance | 🟡 Parcial | La operación inicial es liviana, pero no sabemos cómo se comportará con archivos grandes. |
| Latency | 🟡 Parcial | La respuesta debería ser rápida, pero aún no medimos nada. |
| Operational Complexity | 🟢 Baja | El flujo es simple y controlado. |
| Cost | 🟢 Bajo | No hay infraestructura adicional. |
| Observability | 🔴 Brecha | El sistema todavía es ciego por diseño. |
| Scalability | 🔴 Brecha | No hay estrategia para múltiples archivos ni procesamiento pesado. |

## Insight breve del sistema actual

El primer paso de observabilidad no es instrumentar.

El primer paso es crear un flujo donde la falta de visibilidad duela.

## Próximo problema

El sistema aceptará archivos, pero no podremos saber si el contenido es válido, inválido o problemático.

## Siguiente paso

Implementar el flujo mínimo:

- módulo `05-file-processing-observability-lab`
- entidad `file_processing_job`
- endpoint para aceptar un archivo
- caso de uso para registrar el job en estado `PENDING`