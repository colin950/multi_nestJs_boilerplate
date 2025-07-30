FROM node:20-alpine AS builder

WORKDIR /app


COPY . .

RUN npm install -g pnpm@latest-10
RUN npm run install:api
RUN npm run build:api

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/node_modules ./packages/api/node_modules

ENV NEW_RELIC_HOME=/app/packages/air-wallet-api

ENTRYPOINT [ "node", "./packages/api/dist/packages/api/src/main" ]
