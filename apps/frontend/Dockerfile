FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --shamefully-hoist

FROM deps AS build
COPY apps/frontend apps/frontend
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN cd apps/frontend && /usr/src/app/node_modules/.bin/tsc -b && /usr/src/app/node_modules/.bin/vite build

FROM nginx:1.27-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
