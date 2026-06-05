FROM node:22-alpine AS base

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @welfo/portal --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
RUN npm run build --workspace=@welfo/portal

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 welfo
COPY --from=builder --chown=welfo:nodejs /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=welfo:nodejs /app/apps/portal/.next/static ./apps/portal/.next/static
COPY --from=builder --chown=welfo:nodejs /app/apps/portal/public ./apps/portal/public
USER welfo
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/portal/server.js"]
