FROM node:22-alpine AS builder

WORKDIR /app

COPY web .

RUN npm ci

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY app .
COPY --from=builder /app/dist /app/dist

RUN npm ci

CMD ["node", "index.js"]
