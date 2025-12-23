FROM node:22-bookworm-slim AS builder

WORKDIR /app
ENV NX_DAEMON=false

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build server

FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY --from=builder /app/dist/apps/server/package.json ./

RUN npm install --omit=dev --ignore-scripts

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules

COPY --from=builder --chown=node:node /app/dist/apps/server ./

EXPOSE 3000

CMD ["node", "main.js"]
