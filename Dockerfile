# Build tooling: Node only. Source is bind-mounted at /app by the Makefile.
# Debian (glibc), not Alpine: Node on musl's small thread stacks segfaulted intermittently (dev, lint).
FROM node:24.21.0-bookworm-slim AS build
WORKDIR /app

# Static host for the built site in docs/ (self-hosting or local preview).
FROM nginx:1.30.5-alpine3.24 AS serve
ENV RRQ_BASE=/RRQuilts/
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY docs/ /usr/share/nginx/html/
