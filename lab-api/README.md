# lab-api

API backend construida con NestJS para experimentar con una arquitectura base usando PostgreSQL y Redis.

## Objetivo del proyecto

`lab-api` sirve como laboratorio para:

- conectar NestJS con PostgreSQL mediante TypeORM `DataSource`
- preparar una base para cache/idempotencia con Redis
- tener un entorno local listo con Docker para desarrollo rapido

## Stack tecnologico

- Node.js + TypeScript
- NestJS 11
- PostgreSQL 18
- Redis 8
- Docker Compose (servicios de infraestructura)

## Estructura principal

```text
lab-api/
  src/
    config/
      database.config.ts      # mapea variables de entorno
    database/
      database.module.ts      # modulo de base de datos
      database.service.ts     # inicializa/cierra DataSource
    app.module.ts             # modulo raiz
    main.ts                   # arranque del servidor HTTP
```

## Requisitos previos

- Node.js 20+ (recomendado)
- npm 10+ (o equivalente)
- Docker y Docker Compose (opcional pero recomendado para DB/Redis)

## Configuracion de entorno

Actualmente el proyecto lee estas variables desde `lab-api/.env`:

```env
DATABASE_DIALECT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=lab_db
```

> Nota: el puerto HTTP de la API se toma de `PORT`; si no existe, usa `3000`.

## Arranque rapido

### 1) Levantar infraestructura (Postgres + Redis)

Desde la raiz del repo (`backend-lab/`):

```bash
docker compose up -d
```

Servicios expuestos por defecto:

- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:80`
- Redis: `localhost:6379`
- RedisInsight: `http://localhost:5540`

### 2) Instalar dependencias del API

Desde `lab-api/`:

```bash
npm install
```

### 3) Ejecutar el backend

```bash
# desarrollo (watch)
npm run start:dev

# ejecucion normal
npm run start
```

Al iniciar correctamente deberias ver algo como:

```text
Application running on: http://localhost:3000
```

## Scripts utiles

- `npm run build`: compila TypeScript a `dist/`
- `npm run start`: inicia la app
- `npm run start:dev`: inicia con recarga en caliente
- `npm run lint`: ejecuta ESLint con autofix
- `npm run test`: pruebas unitarias
- `npm run test:e2e`: pruebas end-to-end
- `npm run test:cov`: cobertura de pruebas

## Conexion a base de datos

El `DatabaseService`:

- crea un `DataSource` de TypeORM con configuracion de `ConfigService`
- inicializa la conexion al arrancar el modulo (`onModuleInit`)
- cierra la conexion al detenerse la app (`onModuleDestroy`)

Esto deja la base lista para agregar entidades, repositorios y migraciones en siguientes iteraciones.

## Flujo recomendado de desarrollo

1. Levanta la infraestructura con Docker.
2. Ejecuta `npm run start:dev` en `lab-api/`.
3. Crea entidades/migraciones segun nuevas features.
4. Corre `npm run lint` y `npm run test` antes de cerrar cambios.

## Troubleshooting rapido

- **No conecta a Postgres**: verifica que `docker compose ps` muestre `lab-postgres` en estado healthy/running y que las credenciales de `.env` coincidan.
- **Puerto ocupado**: cambia `PORT` para la API o ajusta puertos en `docker-compose.yml`.
- **Cambios no se reflejan**: confirma que estas usando `npm run start:dev`.

## Proximos pasos sugeridos

- agregar entidades TypeORM y migraciones
- documentar endpoints con Swagger
- introducir modulo de cache con Redis
- agregar pipeline de CI (lint + test)
