# lab-api

Backend Failure Lab: fallos de concurrencia, TOCTOU, doble gasto, ejecución duplicada y operaciones zombie. Cada módulo tiene su propio `README.md` con fallo, daño, endpoints y resultado esperado.

## Mapa de módulos

| Módulo | Mitigaciones / evolución |
|--------|--------------------------|
| [Lost Update](src/modules/lost-update/README.md) | atomic update |
| [TOCTOU](src/modules/toctou/README.md) | conditional update |
| [Double Spending](src/modules/double-spending/README.md) | atomic balance update → transaction |
| [Payment Lab](src/modules/04-payment-lab/README.md) | duplicate execution (evolutivo) |

## Stack

- NestJS 11 + TypeScript  
- TypeORM + PostgreSQL (`synchronize`, `DATABASE_RESET_ON_BOOT` para entorno de laboratorio)  
- Redis en Docker (opcional; sin uso obligatorio en estos escenarios)

## Arranque

```bash
npm install
npm run start:dev
```

Variables típicas: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_RESET_ON_BOOT`.

## k6

Scripts en `k6/`. Por defecto la base es `http://host.docker.internal:3000` (API en el host, puerto 3000). Otra base:

```bash
BASE_URL=http://localhost:3000 k6 run k6/toctou/broken.js
```

Desde `lab-api` con Docker (Linux incluye `host-gateway`):

```bash
docker run --rm -i --add-host=host.docker.internal:host-gateway \
  -v "$(pwd)/k6:/scripts" -e BASE_URL=http://host.docker.internal:3000 \
  grafana/k6 run /scripts/toctou/broken.js
```

| Carpeta | Script | Uso |
|---------|--------|-----|
| `lost-update/` | `problem.js`, `atomic-update.js` | burst 2 VU — broken vs atomic |
| `toctou/` | `broken.js`, `conditional-update.js` | burst — TOCTOU vs update condicional |
| `double-spending/` | `broken.js`, `atomic-balance-update.js`, `transaction.js` | burst — RMW vs atómico vs TX |
| `payment-lab/` | `stage-01-broken.js` | burst 2 VU — misma `externalReference` → duplicate execution |

`k6/shared/http.js` acepta **200 y 201** por defecto.
