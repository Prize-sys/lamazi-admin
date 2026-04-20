# ---- Build stage ----
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci && npm cache clean --force


COPY . .

# Vite env variable (NOT REACT_APP)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production stage ----
FROM nginx:alpine

# Copy built Vite app 
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config (for React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]