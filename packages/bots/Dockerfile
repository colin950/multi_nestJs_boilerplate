FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g pnpm@latest-10
RUN npm run install:bot
RUN npm run build:bot

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/packages/bots/dist ./packages/bots/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/bots/node_modules ./packages/bots/node_modules

ENTRYPOINT [ "node", "./packages/bots/dist/packages/bots/src/main" ]
