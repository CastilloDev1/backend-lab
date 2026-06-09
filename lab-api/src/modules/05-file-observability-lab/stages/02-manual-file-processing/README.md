# Stage 02 — Manual File Processing

## Qué dejó resuelto el stage anterior

El Stage 01 dejó un flujo mínimo para registrar un file processing job.

El sistema ya puede aceptar una solicitud de procesamiento y persistir un job en estado PENDING.

Todavía no procesa el archivo.

## Qué límite apareció

El sistema acepta jobs, pero nadie los ejecuta.

Esto genera una primera ceguera operativa:

- No sabemos si el job está pendiente porque está esperando.
- No sabemos si está pendiente porque nadie lo tomó.
- No sabemos si el sistema realmente puede procesarlo.
- No sabemos cuánto tarda el procesamiento.
- No sabemos qué ocurre entre PENDING y un resultado final.

## Qué vamos a cambiar en core/

Vamos a agregar una acción manual para procesar un job existente.

El procesamiento todavía será simple y controlado.

No vamos a leer un archivo real todavía.

No vamos a usar workers.

No vamos a usar colas.

No vamos a usar logs estructurados.

No vamos a usar métricas.

No vamos a usar tracing.

La única responsabilidad nueva será mover un job desde PENDING hacia COMPLETED o FAILED mediante una ejecución explícita.

## Qué debe quedar probado

Debe quedar probado que:

- Un job PENDING puede ser procesado manualmente.
- El job cambia a PROCESSING al iniciar.
- El job cambia a COMPLETED si la ejecución termina bien.
- El job cambia a FAILED si ocurre un error controlado.
- El sistema registra un last_error cuando falla.
- El flujo sigue siendo pobremente observable.

## Nueva lógica introducida

Se introduce el concepto de ejecución manual de un file processing job.

Estados usados:

- PENDING
- PROCESSING
- COMPLETED
- FAILED

El objetivo no es procesar datos reales todavía.

El objetivo es crear el primer flujo con transición de estados y resultado final.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El sistema puede mover un job a estado final, pero todavía no procesa contenido real. |
| Concurrency | 🔴 Brecha | No existe protección contra dos ejecuciones manuales del mismo job al mismo tiempo. |
| Resilience | 🔴 Brecha | Si el proceso cae en PROCESSING, el job puede quedar atrapado. |
| Recoverability | 🔴 Brecha | No hay retry, recovery ni reanudación. |
| Performance | 🟡 Parcial | El procesamiento es liviano y artificial, todavía no representa carga real. |
| Latency | 🔴 Brecha | No medimos cuánto tarda cada ejecución. |
| Operational Complexity | 🟢 Baja | La ejecución sigue siendo simple y directa. |
| Cost | 🟢 Bajo | No se agrega infraestructura adicional. |
| Observability | 🔴 Brecha | Solo sabemos el estado final; no sabemos qué pasó durante la ejecución. |
| Scalability | 🔴 Brecha | La ejecución manual no escala ni representa operación real. |

## Insight breve del sistema actual

El sistema ya puede ejecutar un job, pero todavía no puede explicar su historia.

Saber que algo terminó en COMPLETED o FAILED no es lo mismo que entender qué pasó.

## Próximo problema

Si un job queda en PROCESSING, no sabemos si sigue trabajando, si falló silenciosamente o si el proceso murió.

## Siguiente paso

Implementar una acción manual para procesar jobs:

- Buscar job por id.
- Validar que exista.
- Validar que esté en PENDING.
- Marcarlo como PROCESSING.
- Simular procesamiento exitoso o fallido.
- Marcarlo como COMPLETED o FAILED.