# Stage 12 — RabbitMQ Channel Recovery Gap

## Qué dejó resuelto el stage anterior

En el Stage 11 demostramos que RabbitMQ puede fallar después de que PostgreSQL confirma correctamente la transacción.

El sistema logró conservar:

```text
Payment creado
Outbox Event creado
Estado PENDING persistido
```

Esto significa que la intención del trabajo no se perdió.

PostgreSQL siguió siendo la fuente de verdad.

---

## Qué límite apareció

Al apagar RabbitMQ y volverlo a encender sin reiniciar la API, apareció el error:

```text
IllegalOperationError: Channel closed
```

Esto demuestra un nuevo límite:

```text
RabbitMQ puede volver a estar disponible,
pero la aplicación puede seguir usando un channel cerrado.
```

El problema ya no es solamente que RabbitMQ falle.

El problema ahora es que el cliente de RabbitMQ dentro de la API no se recupera automáticamente.

---

## Qué vamos a cambiar en core/

En este stage NO vamos a resolver todavía el reconnect.

Primero vamos a documentar y reproducir el problema.

El cambio esperado en `core/` será mínimo y orientado a observar el fallo actual:

```text
RabbitMQ se apaga
↓
La API pierde connection/channel
↓
RabbitMQ vuelve
↓
La API intenta publicar usando un channel cerrado
↓
La publicación falla
```

Todavía no agregaremos:

```text
Reconnect automático
Recreate channel
Retry de publicación
Outbox Relay
DLQ
```

---

## Qué debe quedar probado

Debe quedar probado este escenario:

```text
1. API corriendo.
2. RabbitMQ corriendo.
3. Se crea un payment correctamente.
4. Se apaga RabbitMQ.
5. Se intenta crear otro payment.
6. El outbox_event queda persistido.
7. RabbitMQ no recibe el mensaje.
8. Se vuelve a prender RabbitMQ.
9. Sin reiniciar la API, se intenta publicar nuevamente.
10. La API falla con Channel closed.
```

Resultado esperado:

```text
RabbitMQ está disponible otra vez,
pero la API no recuperó su channel.
```

---

## Nueva lógica introducida

Este stage introduce un nuevo concepto:

```text
RabbitMQ Client Recovery Gap
```

Hasta ahora pensábamos en fallos del broker.

Ahora aparece otro tipo de fallo:

```text
El broker se recupera,
pero el cliente queda en estado inválido.
```

Esto cambia el problema de:

```text
RabbitMQ está caído
```

a:

```text
Mi aplicación no sabe recuperarse cuando RabbitMQ vuelve.
```

---

## Evaluación de la solución actual

| Variable               | Estado actual | Explicación                                                                                 |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| Correctness            | Alto          | PostgreSQL conserva Payment y Outbox Event correctamente.                                   |
| Concurrency            | Alto          | Los controles previos siguen siendo válidos.                                                |
| Resilience             | Bajo          | La API no se recupera sola cuando el channel queda cerrado.                                 |
| Recoverability         | Bajo          | Aunque RabbitMQ vuelva, la aplicación sigue rota hasta reiniciar o reconstruir la conexión. |
| Performance            | Medio         | El problema no es throughput, sino disponibilidad operativa.                                |
| Latency                | Bajo          | Las operaciones afectadas fallan o quedan bloqueadas, no solo lentas.                       |
| Operational Complexity | Medio         | Aparece la necesidad de manejar lifecycle de connection/channel.                            |
| Cost                   | Bajo          | No hay costo alto todavía, pero sí riesgo operativo.                                        |
| Observability          | Bajo          | El sistema no muestra claramente cuándo connection/channel están vivos o muertos.           |
| Scalability            | Medio         | Escalar consumers no ayuda si cada instancia puede quedar con channels cerrados.            |

---

## Insight breve del sistema actual

RabbitMQ puede estar sano y aun así la API puede seguir fallando.

La disponibilidad del broker no garantiza la disponibilidad del cliente.

En sistemas event-driven no basta con tener RabbitMQ corriendo.

También hay que manejar correctamente:

```text
connection lifecycle
channel lifecycle
consumer subscription lifecycle
publisher recovery
```

---

## Próximo problema

El siguiente problema será:

```text
¿Cómo reconstruimos connection/channel cuando RabbitMQ vuelve?
```

Necesitamos una estrategia mínima para que la API pueda:

```text
Detectar channel cerrado
Reconectar a RabbitMQ
Crear un nuevo channel
Recrear la queue
Volver a publicar mensajes
Volver a consumir eventos
```

---

## Siguiente paso

Stage 13 — RabbitMQ Reconnection Strategy

Objetivo:

```text
Permitir que la aplicación reconstruya connection/channel después de una caída de RabbitMQ.
```

Este stage todavía NO resuelve eventos PENDING atrapados en PostgreSQL.

Eso vendrá después con:

```text
Stage 14 — Outbox Relay / Republisher
```