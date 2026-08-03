FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN corepack enable && apk add --no-cache openssl

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install --shamefully-hoist

FROM deps AS build
COPY apps/backend apps/backend
RUN cd apps/backend && /usr/src/app/node_modules/.bin/prisma generate
RUN cd apps/backend && /usr/src/app/node_modules/.bin/tsc -p tsconfig.json

FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/apps/backend/dist apps/backend/dist
COPY --from=build /usr/src/app/apps/backend/prisma apps/backend/prisma
COPY --from=build /usr/src/app/apps/backend/package.json apps/backend/package.json
WORKDIR /usr/src/app/apps/backend
EXPOSE 3000
CMD ["node", "dist/server.js"]
