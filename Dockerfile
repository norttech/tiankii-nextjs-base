# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
LABEL maintainer="melvin@norttech.com"

# openssl is required by Prisma's native query engine on Alpine
RUN apk add --no-cache libc6-compat openssl

# ─── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ─── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client from schema (must run before build)
ENV DATABASE_URL="postgresql://user:password@host:port/db"

RUN yarn prisma generate

# Only NEXT_PUBLIC_* variables are needed at build time.
# Server-side secrets (AUTH_SECRET, DB_URL, etc.) are injected at runtime
# via Cloud Run environment variables or Secret Manager.
RUN yarn build

# ─── Runner ───────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only the standalone output (drastically reduces image size)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema + generated client so the runtime can connect to the DB
# The client is generated to ./prisma/generated/prisma (custom output in schema.prisma)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]