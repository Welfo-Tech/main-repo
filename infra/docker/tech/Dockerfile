FROM node:22-alpine AS base

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @welfo/tech --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
RUN npm ci

FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build --workspace=@welfo/tech

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 welfo
COPY --from=builder --chown=welfo:nodejs /app/apps/tech/.next/standalone ./
COPY --from=builder --chown=welfo:nodejs /app/apps/tech/.next/static ./apps/tech/.next/static
COPY --from=builder --chown=welfo:nodejs /app/apps/tech/public ./apps/tech/public
USER welfo
EXPOSE 3003
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/tech/server.js"]
