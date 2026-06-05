FROM node:22-alpine AS base

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @welfo/blog --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
RUN npm run build --workspace=@welfo/blog

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 welfo
COPY --from=builder --chown=welfo:nodejs /app/apps/blog/.next/standalone ./
COPY --from=builder --chown=welfo:nodejs /app/apps/blog/.next/static ./apps/blog/.next/static
USER welfo
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/blog/server.js"]
