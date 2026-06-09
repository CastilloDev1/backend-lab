# Stage 03 — Job Lifecycle Tracking

## Qué dejó resuelto el stage anterior

El Stage 02 introdujo la ejecución manual de jobs.

Ahora un job puede recorrer el siguiente ciclo:

PENDING
↓
PROCESSING
↓
COMPLETED

o

PENDING
↓
PROCESSING
↓
FAILED

El sistema ya no es únicamente un registro de solicitudes. Ahora existe una ejecución real.

## Qué límite apareció

Aunque los jobs ahora se ejecutan, seguimos teniendo una gran falta de visibilidad.

Actualmente solo conocemos el estado final.

Podemos responder:

- ¿Terminó?
- ¿Falló?

Pero todavía no podemos responder:

- ¿Cuándo comenzó?
- ¿Cuándo terminó?
- ¿Cuánto duró?
- ¿Cuánto tiempo estuvo ejecutándose?
- ¿Cuáles jobs son lentos?
- ¿Cuáles jobs son rápidos?

El sistema sigue siendo operacionalmente ciego.

## Qué vamos a cambiar en core/

Vamos a introducir el concepto de ciclo de vida de ejecución.

El sistema comenzará a registrar:

- Momento de inicio.
- Momento de finalización.
- Duración total de ejecución.

Todavía no vamos a registrar eventos.

Todavía no vamos a generar logs.

Todavía no vamos a medir métricas.

Todavía no vamos a introducir tracing.

La única responsabilidad nueva será capturar la historia temporal básica de un job.

## Qué debe quedar probado

Debe quedar probado que:

- Un job registra cuándo inició.
- Un job registra cuándo terminó.
- Un job registra su duración total.
- Un job COMPLETED conserva su información temporal.
- Un job FAILED conserva su información temporal.
- Podemos identificar jobs lentos y rápidos mediante datos persistidos.

## Nueva lógica introducida

Se introduce el concepto de lifecycle tracking.

Nuevos datos operacionales:

- started_at
- completed_at
- duration_ms

Estos datos representan la primera señal operacional persistente del sistema.

Todavía no existe observabilidad.

Simplemente estamos comenzando a generar información que más adelante podrá ser observada.

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El flujo funciona, pero aún no procesa archivos reales. |
| Concurrency | 🔴 Brecha | No existe protección contra múltiples ejecuciones concurrentes. |
| Resilience | 🔴 Brecha | Un job puede quedar atrapado en PROCESSING. |
| Recoverability | 🔴 Brecha | No existe recuperación automática. |
| Performance | 🟡 Parcial | Ahora podremos comenzar a medir tiempos reales. |
| Latency | 🟡 Parcial | La duración deja de ser desconocida. |
| Operational Complexity | 🟢 Baja | La solución sigue siendo sencilla. |
| Cost | 🟢 Bajo | No requiere infraestructura adicional. |
| Observability | 🔴 Brecha | Tenemos datos operacionales, pero todavía no tenemos mecanismos para observarlos. |
| Scalability | 🔴 Brecha | El procesamiento continúa siendo manual. |

## Insight breve del sistema actual

Un estado final responde:

"qué ocurrió"

Pero no responde:

"cómo ocurrió"

El tiempo es la primera dimensión necesaria para comenzar a entender el comportamiento de un sistema.

## Próximo problema

Cuando un job falle seguiremos sin poder responder:

- ¿Qué paso estaba ejecutando?
- ¿Dónde ocurrió el fallo?
- ¿Qué hizo antes de fallar?

La duración ayuda a entender cuándo ocurrió algo.

Todavía no ayuda a entender qué ocurrió.

## Siguiente paso

Extender el modelo de jobs para registrar:

- started_at
- completed_at
- duration_ms

y actualizar el flujo de procesamiento para persistir automáticamente esa información durante la ejecución.