# Stage 08 — Centralized Log Search

## Qué dejó resuelto el stage anterior

El Stage 07 provocó presión de volumen usando k6.

El sistema generó muchas ejecuciones y muchos logs estructurados.

Esto permitió demostrar un dolor real:

- Los logs existen.
- Los logs tienen estructura.
- Pero stdout no escala como herramienta de investigación operacional.

Con múltiples jobs ejecutándose al mismo tiempo, los logs se intercalan y seguir una ejecución específica se vuelve difícil.

## Qué límite apareció

stdout sirve para observar actividad local en tiempo real.

Pero falla cuando necesitamos:

- Buscar por jobId.
- Filtrar por eventType.
- Encontrar solo errores.
- Consultar logs históricos.
- Analizar jobs lentos.
- Investigar múltiples ejecuciones bajo volumen.

La información existe, pero no es consultable de forma eficiente.

## Qué vamos a cambiar en core/

Vamos a introducir una integración mínima con OpenSearch.

El sistema comenzará a enviar logs estructurados a un índice centralizado.

Todavía no vamos a introducir:

- Dashboards avanzados
- Alerting
- Metrics
- Tracing
- OpenTelemetry
- Correlation IDs
- SLOs

La única responsabilidad nueva será permitir búsqueda centralizada de logs estructurados.

## Qué debe quedar probado

Debe quedar probado que:

- OpenSearch corre localmente con Docker.
- OpenSearch Dashboards permite explorar índices.
- El backend puede conectarse a OpenSearch.
- Los logs de jobs se indexan correctamente.
- Podemos buscar por jobId.
- Podemos filtrar por eventType.
- Podemos encontrar JOB_FAILED.
- Podemos consultar logs sin depender de stdout.

## Nueva lógica introducida

Se introduce Centralized Log Search.

Los logs dejan de vivir únicamente en la consola del proceso.

Ahora también serán enviados a un motor de búsqueda.

OpenSearch no reemplaza PostgreSQL.

OpenSearch no reemplaza los eventos persistidos.

OpenSearch cumple otra responsabilidad:

- búsqueda operacional
- exploración rápida
- investigación de incidentes
- análisis histórico de logs

## Evaluación de la solución actual

| Variable | Estado actual | Explicación |
|---|---|---|
| Correctness | 🟡 Parcial | El flujo funcional no cambia; solo agregamos salida operacional. |
| Concurrency | 🔴 Brecha | Aún no protegemos ejecuciones concurrentes del mismo job. |
| Resilience | 🟡 Parcial | Si OpenSearch falla, el core no debería romperse. |
| Recoverability | 🔴 Brecha | No hay recovery automático de jobs atrapados. |
| Performance | 🟡 Parcial | Indexar logs agrega costo adicional por ejecución. |
| Latency | 🟡 Parcial | El envío de logs puede afectar latencia si se hace de forma bloqueante. |
| Operational Complexity | 🟡 Media | Aparece una nueva herramienta que debe levantarse y configurarse. |
| Cost | 🟡 Medio | Se agrega infraestructura local con consumo de memoria. |
| Observability | 🟢 Mejorando | Los logs ya pueden buscarse y filtrarse fuera de stdout. |
| Scalability | 🟡 Parcial | Mejora la búsqueda, pero todavía no hay estrategia de ingestión robusta. |

## Insight breve del sistema actual

Generar logs no es suficiente.

Estructurar logs tampoco es suficiente.

Cuando el volumen crece, el siguiente problema es poder encontrarlos.

Centralizar logs aparece cuando stdout deja de ser una herramienta útil de investigación.

## Próximo problema

Enviar logs directamente desde el flujo principal puede introducir nuevos riesgos:

- Si OpenSearch está caído, ¿debe fallar el procesamiento?
- Si OpenSearch responde lento, ¿debe aumentar la latencia del job?
- Si se generan muchos logs, ¿el backend debe esperar cada indexación?

La búsqueda mejora.

Pero aparece un nuevo límite:

la observabilidad no debe romper el negocio.

## Siguiente paso

Configurar la integración mínima:

- Instalar cliente de OpenSearch.
- Crear un provider para conexión.
- Crear un servicio de indexación de logs.
- Enviar logs estructurados del JobOperationalLogger hacia OpenSearch.
- Mantener stdout como salida local.