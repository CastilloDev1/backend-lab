# 04-payments-lab

## Objetivo

Comprender cómo evoluciona un sistema backend cuando aparecen problemas reales de concurrencia, consistencia y procesamiento asíncrono.

Este laboratorio NO busca enseñar tecnologías.

Busca demostrar:

```text
problema
↓
daño
↓
causa raíz
↓
solución mínima
↓
nuevo límite
```

---

# Evolución del laboratorio

## Stage 01 — Lost Update

### Problema

Dos peticiones modifican el mismo balance simultáneamente.

### Daño

Se pierde una actualización.

### Aprendizaje

Leer y luego escribir no es seguro bajo concurrencia.

### Solución

Atomic Update.

---

## Stage 02 — TOCTOU

### Problema

Validar primero y actuar después.

### Daño

La realidad cambia entre la validación y la ejecución.

### Aprendizaje

Check y Action deben ocurrir juntos.

### Solución

Validación dentro del UPDATE.

---

## Stage 03 — Double Spending

### Problema

Varias peticiones intentan gastar el mismo saldo.

### Daño

Balances negativos.

### Aprendizaje

La consistencia debe protegerse desde la base de datos.

### Solución

UPDATE condicional.

---

## Stage 04 — Duplicate Execution

### Problema

La misma operación se ejecuta más de una vez.

### Daño

Cobros duplicados.

### Aprendizaje

Los sistemas distribuidos generan duplicados.

### Solución

Idempotencia persistente.

---

## Stage 05 — Operation States

### Problema

No saber qué ocurrió con una operación.

### Daño

Procesos ambiguos.

### Solución

Estados explícitos:

```text
PENDING
PROCESSING
PROCESSED
FAILED
```

---

## Stage 06 — Transactional Consistency

### Problema

Operaciones parcialmente ejecutadas.

### Daño

Datos inconsistentes.

### Solución

Transacciones PostgreSQL.

---

## Stage 07 — Worker Processing

### Problema

La petición HTTP ejecuta demasiado trabajo.

### Daño

Mayor latencia y menor resiliencia.

### Solución

Worker asíncrono.

---

## Stage 08 — Transactional Outbox

### Problema

Persistir el Payment y perder el evento.

### Daño

Trabajo perdido.

### Solución

Outbox Pattern.

---

## Stage 09 — Safe Claim

### Problema

Múltiples workers procesan el mismo evento.

### Daño

Duplicidad de ejecución.

### Solución

```text
FOR UPDATE SKIP LOCKED
```

---

## Stage 10 — RabbitMQ Transport

### Problema

Polling constante sobre PostgreSQL.

### Daño

Carga innecesaria.

### Solución

RabbitMQ como transporte de eventos.

---

## Stage 11 — Publisher Failure Gap

### Problema

PostgreSQL confirma la transacción pero RabbitMQ falla.

### Daño

Evento persistido pero nunca publicado.

### Aprendizaje

Persistir no implica entregar.

---

## Stage 12 — RabbitMQ Reconnection Strategy

### Problema

RabbitMQ vuelve pero el cliente conserva channels inválidos.

### Daño

La aplicación sigue rota.

### Solución

Reconstrucción automática de connection/channel.

---

## Stage 13 — Outbox Relay / Republisher

### Problema

Eventos PENDING quedan atrapados en PostgreSQL.

### Daño

Trabajo nunca ejecutado.

### Solución

Republisher periódico.

---

## Stage 14 — Consumer State Claim

### Problema

Múltiples entregas del mismo mensaje.

### Daño

Reprocesamiento.

### Solución

Reclamar únicamente eventos válidos.

---

# Resultado Final

El laboratorio terminó demostrando:

```text
Correctness
Concurrency Control
Transactional Consistency
Idempotency
Outbox Pattern
Worker Processing
RabbitMQ Recovery
Event Recovery
```

---

# Lo que deliberadamente NO implementa

```text
Kafka
DLQ avanzada
SAGA
Event Sourcing
Kubernetes
Service Mesh
Observability completa
```

Porque esos problemas todavía no habían aparecido naturalmente.
