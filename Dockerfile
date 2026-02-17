# Multi-stage production Dockerfile for Dokuntag

# ------------------------
# Builder Stage
# ------------------------
FROM node:20-alpine AS builder

# OpenSSL yükleme (Prisma generate için)
RUN apk add --no-cache openssl bash

WORKDIR /app

# Package ve lock dosyalarını kopyala
COPY package.json package-lock.json ./

# Prod dependency yükle
RUN npm ci --only=production

# Tüm proje dosyalarını kopyala
COPY . .

# Build
RUN npm run build

# Prisma generate
RUN npx prisma generate

# ------------------------
# Runner Stage
# ------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# OpenSSL yükleme (Prisma runtime için)
RUN apk add --no-cache openssl bash

# Builder’dan gerekli dosyaları kopyala
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Prod ortam
ENV NODE_ENV=production

# Healthcheck: 2 saniyede bir, 3 başarısızda unhealthy
HEALTHCHECK --interval=2s --timeout=2s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Port
EXPOSE 3000

# Başlat
CMD ["npm", "start"]