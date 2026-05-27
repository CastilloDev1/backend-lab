# Stage 10 — RabbitMQ Outbox Transport

## 1. Qué dejó resuelto el stage anterior

El sistema ya entiende los conceptos mínimos de RabbitMQ:

- broker
- connection
- channel
- queue
- publish
- consume
- ack
- nack

También quedó definida la separación arquitectónica:

- RabbitMQ como infraestructura compartida en shared/
- Payment Lab como dueño de sus colas y mensajes
- stages/ solo como documentación

---

## 2. Qué límite apareció

PostgreSQL sigue siendo usado como cola operacional mediante polling.

El worker actual consulta constantemente eventos pendientes en la tabla de outbox.

Esto genera:

- más queries sobre PostgreSQL
- más escrituras por evento
- más transacciones
- más locks
- mayor latencia bajo carga
- menor throughput

Caso real observado:

606 req/s → 207 req/s

El sistema es correcto, pero PostgreSQL está haciendo demasiadas responsabilidades.

---

## 3. Qué vamos a cambiar en core/

Vamos a introducir RabbitMQ como transporte inicial de eventos de outbox.

No vamos a eliminar todavía el worker con polling.

No vamos a reemplazar PostgreSQL.

Nueva regla:

Cuando se cree un outbox_event en PostgreSQL,
también se publicará un mensaje en RabbitMQ con el id del evento.

Mensaje mínimo:

- outboxEventId

PostgreSQL seguirá teniendo la verdad del evento.

RabbitMQ solo transportará la señal de trabajo pendiente.

---

## 4. Qué debe quedar probado

Debe quedar probado que:

- el outbox_event se guarda en PostgreSQL
- luego se publica un mensaje en RabbitMQ
- el mensaje contiene el outboxEventId
- el mensaje llega a la queue del Payment Lab
- el worker de polling sigue existiendo como respaldo

En este stage todavía NO debe quedar probado:

- consumer real de pagos
- eliminación del polling
- retries con RabbitMQ
- dead-letter queue
- control avanzado de fallos

---

## 5. Cómo lo logramos

Crear infraestructura compartida:

- src/shared/messaging/rabbitmq/rabbitmq.connection.ts
- src/shared/messaging/rabbitmq/rabbitmq.constants.ts

Crear un publisher específico del Payment Lab en core/.

Este publisher debe:

- recibir un outboxEventId
- obtener el channel compartido de RabbitMQ
- asegurar la queue del Payment Lab
- publicar el mensaje

El caso de uso que crea el outbox_event llamará al publisher después de guardar el evento en PostgreSQL.

---

## 6. Evaluación de la solución actual

| Variable | Estado | Explicación |
|----------|--------|------------|
| Correctitud | Alta | PostgreSQL sigue guardando la verdad |
| Resiliencia | Media | Polling sigue como respaldo |
| Performance | Media | Se empieza a reducir dependencia del polling |
| Latencia | Media | RabbitMQ permite transporte más reactivo |
| Costo | Medio | Se agrega RabbitMQ como infraestructura |
| Complejidad | Alta | Ahora existen DB + broker |
| Escalabilidad | Media | Mejora transporte, pero aún no elimina polling |

---

## 6.1 Evaluación del sistema completo

| Variable | Estado global | Explicación |
|----------|-------------|------------|
| Correctitud | Alta | La verdad sigue en PostgreSQL |
| Resiliencia | Alta | El sistema conserva polling como respaldo |
| Performance | Media | RabbitMQ reduce presión futura sobre PostgreSQL |
| Latencia | Media | El sistema empieza a moverse hacia push |
| Costo | Medio | Se agrega un broker al laboratorio |
| Complejidad | Alta | Hay más piezas operativas |
| Escalabilidad | Media | Todavía no se reemplaza completamente el polling |

---

## 7. Insight

RabbitMQ no reemplaza el Outbox Pattern.

RabbitMQ reemplaza el polling como mecanismo de transporte.

La base de datos sigue siendo la autoridad del negocio.

El mensaje en RabbitMQ no debe contener toda la verdad del pago.

Debe transportar una referencia:

outboxEventId

El consumer consultará PostgreSQL para validar el estado real antes de procesar.

---

## 8. Próximo problema

Aparece un nuevo fallo posible:

PostgreSQL puede guardar correctamente el outbox_event,
pero RabbitMQ puede fallar antes de publicar el mensaje.

Eso deja un evento guardado en la base de datos,
pero sin señal en RabbitMQ.

Por eso todavía no eliminamos el worker con polling.

El siguiente límite será entender cómo proteger la brecha entre:

guardar en PostgreSQL
y publicar en RabbitMQ