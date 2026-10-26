FROM node:22.14.0-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ARG VITE_API_MODE=api
ARG VITE_FEATURE_DEMO=true
ARG VITE_DEMO_PASSWORD=
ENV VITE_API_MODE=$VITE_API_MODE \
    VITE_FEATURE_DEMO=$VITE_FEATURE_DEMO \
    VITE_DEMO_PASSWORD=$VITE_DEMO_PASSWORD
RUN npm run build

FROM nginx:1.27.5-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
