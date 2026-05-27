# Stage 09 — RabbitMQ Introduction

## 1. Qué dejó resuelto el stage anterior

El sistema puede:

- procesar eventos con retry seguro
- evitar doble ejecución usando idempotencia
- recuperar eventos atascados
- garantizar consistencia en PostgreSQL

---

## 2. Qué límite apareció

El sistema sigue dependiendo de polling sobre PostgreSQL.

Bajo carga:

- el throughput bajó significativamente
- aumentó la latencia (avg y p95)
- el worker ejecuta queries constantemente aunque no haya eventos
- PostgreSQL realiza múltiples lecturas y escrituras por evento

Caso real observado:

606 req/s → 207 req/s

El sistema sigue siendo correcto, pero empieza a ser ineficiente como cola.

---

## 3. Qué vamos a cambiar en core/

No vamos a reemplazar PostgreSQL.

Vamos a introducir RabbitMQ como transporte de mensajes.

Nueva idea:

PostgreSQL sigue siendo la fuente de verdad.

RabbitMQ será el mecanismo para notificar trabajo pendiente,
evitando polling constante.

---

## 4. Qué debe quedar probado

En este stage NO vamos a integrar pagos.

Solo queremos probar:

- RabbitMQ está corriendo
- podemos conectarnos desde NestJS
- podemos enviar un mensaje
- el mensaje llega a una queue
- podemos observarlo en el dashboard

---

## 5. Cómo lo logramos

Agregar RabbitMQ como infraestructura:

- docker-compose en la raíz

Configurar:

- imagen oficial con management UI
- puerto AMQP (5672)
- puerto dashboard (15672)

Validar:

- acceso al panel web
- login correcto
- broker funcionando

---

## 6. Evaluación de la solución actual

| Variable | Estado | Explicación |
|----------|--------|------------|
| Correctitud | Alta | PostgreSQL sigue protegiendo la verdad |
| Resiliencia | Alta | Retry + idempotencia funcionan |
| Performance | Baja | Polling afecta throughput |
| Latencia | Alta | Worker no es reactivo |
| Costo | Medio | Más carga en PostgreSQL |
| Complejidad | Alta | Mucha lógica en DB |
| Escalabilidad | Limitada | PostgreSQL como cola no escala bien |

---

## 6.1 Evaluación del sistema completo

| Variable | Estado global | Explicación |
|----------|-------------|------------|
| Correctitud | Alta | No hay duplicados ni pérdida |
| Resiliencia | Alta | Sistema tolera fallos |
| Performance | Baja | Polling constante |
| Latencia | Alta | No es inmediato |
| Costo | Medio | DB sobrecargada |
| Complejidad | Alta | Muchos roles en PostgreSQL |
| Escalabilidad | Limitada | Cuello en polling |

---

## 7. Insight

PostgreSQL es excelente como fuente de verdad.

Pero usarlo como cola operacional introduce:

- polling constante
- más queries
- más locks
- más latencia

Necesitamos un modelo basado en eventos, no en consultas repetidas.

---

## 8. Próximo problema

El sistema necesita dejar de preguntar constantemente por trabajo.

Necesitamos un mecanismo donde:

el sistema reciba trabajo cuando existe  
y no tenga que buscarlo constantemente  

Aquí es donde entra RabbitMQ.