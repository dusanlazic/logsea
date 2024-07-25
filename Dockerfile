FROM node:18-alpine AS build-web
WORKDIR /app
ADD web .
RUN npm install
ARG VERSION
ENV VITE_LOGSEA_VERSION=$VERSION
RUN npm run build

FROM node:18-alpine AS build-app
WORKDIR /app
COPY app .
RUN npm install --only=production
COPY --from=build-web /app/dist /app/dist

FROM gcr.io/distroless/nodejs18-debian11
COPY --from=build-app /app /
CMD ["index.js"]
