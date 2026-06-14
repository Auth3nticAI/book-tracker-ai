# ---- Build stage --------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps with package-lock fidelity
COPY package*.json ./
RUN npm ci

# Build the app. NEXT_PUBLIC_API_URL is baked in at build time.
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- Runtime stage ------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy the standalone Next output + static assets + public dir
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
