# Stage 11 — Publisher Failure Gap

## Objetivo

Demostrar que el Outbox Pattern evita perder la intención de trabajo, pero NO garantiza que un evento llegue a RabbitMQ.

Este stage busca exponer una nueva brecha del sistema:

```text
PostgreSQL Commit OK
RabbitMQ Publish FAIL
```

Aunque la transacción se confirme correctamente en PostgreSQL, el evento puede no llegar al broker.

---

# Historia del problema

Imaginemos el siguiente flujo:

```text
Usuario solicita un pago por 100.
```

El sistema ejecuta:

```text
1. Crear Payment.
2. Crear Outbox Event.
3. Commit PostgreSQL.
4. Publicar mensaje en RabbitMQ.
```

Hasta este punto parece seguro.

Pero existe una ventana crítica:

```text
Payment      -> Persistido
Outbox Event -> Persistido
RabbitMQ     -> No recibió mensaje
```

Si RabbitMQ falla después del commit, ningún consumer recibirá el evento.

---

# Escenario

Estado inicial:

```text
Account Balance = 1000
```

Petición:

```http
POST /payments

{
  "accountId": 1,
  "amount": 100
}
```

Resultado esperado:

```text
Payment creado.
Outbox Event creado.
RabbitMQ falla.
```

Estado final:

```text
Account Balance = 1000
```

```text
Payment existe.
```

```text
Outbox Event existe.
```

```text
RabbitMQ no recibió mensaje.
```

```text
Consumer nunca ejecutó el débito.
```

---

# Problema descubierto

El sistema conserva la intención de trabajo.

Pero no garantiza su publicación.

El evento no se pierde porque sigue almacenado en PostgreSQL.

Sin embargo:

```text
Nadie sabe que debe ejecutarlo.
```

El trabajo queda pendiente indefinidamente.

---

# ¿Por qué ocurre?

Porque PostgreSQL y RabbitMQ son sistemas independientes.

No existe una transacción distribuida entre ambos.

El siguiente flujo NO existe:

```text
BEGIN

INSERT payment
INSERT outbox_event
PUBLISH rabbitmq

COMMIT
```

RabbitMQ no participa en la transacción de PostgreSQL.

---

# Qué sí resuelve Outbox Pattern

Outbox Pattern garantiza:

```text
La intención del evento queda almacenada.
```

Si el proceso cae:

```text
El evento sigue existiendo.
```

No hay pérdida de información.

---

# Qué NO resuelve Outbox Pattern

Outbox Pattern NO garantiza:

```text
Que el evento sea publicado.
```

Tampoco garantiza:

```text
Que RabbitMQ lo reciba.
```

Tampoco garantiza:

```text
Que un consumer lo procese.
```

---

# Nuevo límite encontrado

Ahora existe una nueva brecha:

```text
DB Commit
↓
RabbitMQ Publish
```

Si RabbitMQ falla entre ambos pasos:

```text
El evento queda atrapado en PostgreSQL.
```

---

# Resultado del Stage

Antes:

```text
Polling PostgreSQL.
```

Problema:

```text
Muchos queries.
Muchos locks.
Mucho overhead.
```

Después:

```text
RabbitMQ transporta eventos.
```

Nuevo problema:

```text
Dual Write Gap.
```

El sistema puede confirmar la transacción local y fallar al publicar el mensaje.

---

# Conclusiones

Aprendimos que:

* RabbitMQ elimina gran parte del polling.
* PostgreSQL sigue siendo la fuente de verdad.
* Outbox Pattern evita perder la intención del evento.
* RabbitMQ no participa en la transacción PostgreSQL.
* Existe una brecha entre persistir y publicar.

---

# Importante

Observacion
* Además del Dual Write Gap, apareció un problema operativo:
la conexión RabbitMQ no tiene estrategia de reconnect automático.
Es decir; la API no se recupera sola porque no reconstruye connection/channel/consumer.
* RabbitMQ puede volver a estar disponible, pero eso no implica que la aplicación recupere automáticamente su conexión, canal o consumer. La resiliencia del broker no reemplaza la resiliencia del cliente.

# Qué sigue

Próximo Stage:

```text
Stage 12 — Outbox Relay / Republisher
```

Objetivo:

```text
Detectar eventos pendientes de publicación
y reenviarlos automáticamente a RabbitMQ.
```

Hasta este punto el problema fue identificado.

Todavía NO ha sido solucionado.
