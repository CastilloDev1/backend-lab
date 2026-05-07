# lab-api

Laboratorio backend con NestJS para simular race conditions en pagos y comparar estrategias de mitigación a nivel aplicación.

## Stack

- NestJS 11 + TypeScript
- TypeORM + PostgreSQL
- Redis (infra preparada para escenarios siguientes)

## Arquitectura actual

```text
src/
  app.module.ts
  config/database.config.ts
  database/database.module.ts
  modules/payments-race/
    controller/
    domain/
    infrastructure/
    scenarios/problem/
```

Lectura arquitectónica (estado actual):

- `AppModule` funciona como composition root: inicializa configuración global, monta la infraestructura de persistencia y registra el módulo vertical de negocio.
- `modules/payments-race` está organizado por slice funcional (controller/domain/infrastructure/scenario), lo que desacopla el experimento de race condition del resto del sistema.
- `controller/scenario-router.service.ts` centraliza el dispatch del escenario; hoy solo resuelve `problem`, pero define el punto de extensión para `idempotency`, `distributed-lock` e híbridos sin multiplicar endpoints.
- `infrastructure/postgres/user.repository.ts` encapsula acceso a TypeORM para evitar que la lógica de escenario dependa directamente del `Repository<User>`.
- `infrastructure/redis/*` está declarado como contrato de integración para estrategias futuras; no ejecuta lógica en runtime por ahora.

## Configuración

Variables activas en `.env`:

```env
DATABASE_DIALECT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=lab_db
DATABASE_RESET_ON_BOOT=true
```

Notas técnicas:

- `ConfigModule` se registra como global, habilitando acceso transversal a `ConfigService` sin imports repetidos por módulo.
- `database.config.ts` normaliza variables de entorno bajo el namespace `database` y permite inyección tipada en `DatabaseModule`.
- `DatabaseModule` usa `TypeOrmModule.forRootAsync(...)` para resolver configuración en runtime (host/port/credenciales) desde `.env`.
- `autoLoadEntities: true` evita acoplar la lista de entidades en la raíz; cada módulo registra sus entidades con `forFeature(...)`.
- `synchronize: true` mantiene sincronía esquema-entidad en contexto de laboratorio; no es una recomendación de producción.
- `dropSchema` queda gobernado por `DATABASE_RESET_ON_BOOT` para controlar reinicios limpios del esquema durante pruebas.

## Seed de laboratorio

En `main.ts` se hace seed determinístico al boot:

- limpieza de tabla `user` (`repository.clear()`)
- inserción de 3 usuarios UUID con balance inicial `1000`

Esto garantiza corridas reproducibles para pruebas de concurrencia.

## Endpoint disponible

- `POST /payments?scenario=problem`

Body:

```json
{
  "userId": "11111111-1111-1111-1111-111111111111",
  "amount": 300
}
```

`scenario` default: `problem`.

## Comandos

```bash
npm install
npm run start:dev
npm run build
```
