# ── NewPerks — imagem de produção ───────────────────────────────
# Multi-stage: instala deps, builda o Next, e roda enxuto.
# Optei por manter node_modules de produção no runner (em vez de
# output:standalone) pra evitar fragilidade do file-tracing com o
# Prisma client. Confiável pra deploy manual na VPS; dá pra enxugar
# depois (Trilho B) se o tamanho da imagem incomodar.

# 1) Dependências completas (inclui dev — precisamos pra buildar)
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm install (em vez de npm ci) tolera o lockfile gerado no Windows,
# que carrega binários opcionais de plataforma diferentes do Linux.
RUN npm install --no-audit --no-fund

# 2) Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Gera o Prisma Client e builda o Next
RUN npx prisma generate && npm run build

# 3) Runner — imagem final que vai rodar na VPS
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copia tudo que o runtime precisa (app buildado + deps + prisma)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# Aplica migrations pendentes e sobe o servidor.
# Se o banco ainda não estiver pronto, o compose (depends_on healthcheck) segura.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
