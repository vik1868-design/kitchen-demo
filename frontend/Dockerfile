# ── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .

# Use environment variable passed from Render
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:3001}

RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: serve React SPA, proxy /api -> Express
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
