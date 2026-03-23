# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app with backend URL
ARG VITE_BACKEND_URL
ARG VITE_AI_SERVICE_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_AI_SERVICE_URL=${VITE_AI_SERVICE_URL}

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
