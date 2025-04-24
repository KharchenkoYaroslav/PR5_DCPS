FROM node:lts-alpine as builder

WORKDIR /app
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY babel.config.json ./
COPY .swcrc ./
COPY libs ./libs
COPY apps/server ./apps/server

RUN npm ci
RUN npx nx build server

FROM node:lts-alpine
WORKDIR /app

RUN addgroup --system server && \
    adduser --system -G server server

COPY --from=builder /app/dist/apps/server ./server
RUN chown -R server:server .

RUN npm --prefix server --omit=dev -f install

USER server
ENV HOST=0.0.0.0
ENV PORT=3000

CMD [ "node", "server" ]
