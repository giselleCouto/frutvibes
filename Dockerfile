# Etapa 1: gera o site estático
FROM node:22-alpine AS build
WORKDIR /app
COPY build.mjs ./
COPY static ./static
RUN node build.mjs

# Etapa 2: serve a pasta public/ com o Caddy
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/public /srv
ENV PORT=8080
EXPOSE 8080
