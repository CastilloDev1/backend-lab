# Stage 12 — Outbox Relay / Republisher

## Qué dejó resuelto el stage anterior

En el Stage 11 demostramos que RabbitMQ puede fallar después de que PostgreSQL confirma exitosamente una transacción.

El sistema logró:

* Persistir correctamente el Payment.
* Persistir correctamente el Outbox Event.
* Mantener PostgreSQL como fuente de verdad.
* Evitar la pérdida de información.

Sin embargo, el sistema NO logró:

* Garantizar la publicación del evento.
* Garantizar que RabbitMQ recibiera el mensaje.
* Garantizar que el Consumer ejecutara el trabajo pendiente.

---

## Qué límite apareció

Apareció una nueva brecha operativa:

```text
PostgreSQL Commit OK
RabbitMQ Publish FAIL
```

El evento no se pierde.

Pero tampoco se ejecuta.

Queda almacenado en PostgreSQL sin que ningún Consumer pueda procesarlo.

Esto genera un nuevo estado del sistema:

```text
Trabajo Persistido
≠
Trabajo Ejecutado
```

Ahora el sistema puede conservar la intención del trabajo sin garantizar su entrega.

---

## Qué vamos a cambiar en core/

Vamos a introducir un nuevo componente llamado outbox-relay-service.ts responsable de recuperar eventos pendientes de publicación.

Su única responsabilidad será:

```text
Buscar eventos pendientes
↓
Publicarlos nuevamente en RabbitMQ
```

Este componente NO ejecutará lógica de negocio.

NO modificará balances.

NO procesará pagos.

NO reemplazará Consumers.

Su único objetivo será garantizar que los eventos almacenados en PostgreSQL eventualmente lleguen al broker.

---

## Qué debe quedar probado

Debe poder demostrarse el siguiente escenario:

### Escenario 1

RabbitMQ apagado.

```text
Payment creado
Outbox Event creado
Evento queda pendiente
```

### Escenario 2

RabbitMQ vuelve a estar disponible.

```text
Relay detecta evento pendiente
Relay publica evento
Consumer recibe evento
Consumer ejecuta el débito
```

### Resultado esperado

```text
Ningún evento persistido queda atrapado indefinidamente.
```

---

## Nueva lógica introducida

Se introduce el concepto de:

```text
Event Recovery
```

El sistema ya no dependerá exclusivamente del flujo síncrono:

```text
Payment
↓
Publish
↓
Consume
```

Ahora aparece un segundo camino:

```text
Payment
↓
Outbox Persistido
↓
Relay
↓
RabbitMQ
↓
Consumer
```

Esto convierte PostgreSQL en una red de seguridad para eventos que no lograron ser publicados inicialmente.

---

## Evaluación de la solución actual

| Variable               | Estado Actual | Explicación                                                                                          |
| ---------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| Correctness            | Alto          | Los datos continúan siendo consistentes y PostgreSQL conserva la verdad del negocio.                 |
| Concurrency            | Alto          | Los mecanismos de control de concurrencia implementados previamente siguen siendo válidos.           |
| Resilience             | Medio         | El sistema ya no pierde eventos, pero todavía depende de procesos de recuperación.                   |
| Recoverability         | Alto          | Los eventos pendientes pueden recuperarse posteriormente.                                            |
| Performance            | Medio         | Aparece trabajo adicional de búsqueda y republicación.                                               |
| Latency                | Media         | Algunos eventos pueden procesarse más tarde que otros.                                               |
| Operational Complexity | Media         | Se introduce un nuevo componente operativo dentro del sistema.                                       |
| Cost                   | Medio         | Incrementan las consultas sobre Outbox y el tráfico hacia RabbitMQ.                                  |
| Observability          | Bajo          | Aún no existe trazabilidad suficiente para entender el ciclo completo de un evento.                  |
| Scalability            | Medio         | Mejora la tolerancia a fallos, pero aún no se han abordado problemas de ordenamiento o distribución. |

---

## Insight breve del sistema actual

El sistema ya no depende completamente de RabbitMQ para conservar trabajo pendiente.

RabbitMQ puede fallar.

La aplicación puede fallar.

El Consumer puede fallar.

Pero mientras PostgreSQL conserve el Outbox Event, el sistema mantiene la posibilidad de completar el trabajo más adelante.

Por primera vez el sistema comienza a acercarse a un modelo de procesamiento eventualmente consistente.

---

## Próximo problema

Una vez que podamos republicar eventos pendientes aparecerá un nuevo riesgo:

```text
Publicar el mismo evento varias veces.
```

Cuando múltiples intentos de publicación ocurren sobre el mismo evento comenzarán a aparecer problemas relacionados con:

```text
Redelivery
Duplicate Delivery
Retry Semantics
```

---

## Siguiente paso

Stage 13 — Consumer State Claim

Objetivo:

```text
Evitar que múltiples consumidores o múltiples entregas
reclamen el mismo evento simultáneamente.
```

Comenzaremos a endurecer el Consumer para prepararlo para escenarios de reintento, redelivery y recuperación.
