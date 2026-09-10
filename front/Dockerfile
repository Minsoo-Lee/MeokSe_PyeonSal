# syntax=docker/dockerfile:1

# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# package.json/lock만 먼저 복사해서 의존성 레이어를 캐싱한다.
# (소스 코드만 바뀌었을 땐 npm ci를 다시 안 돌리고 캐시 재사용)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite는 VITE_ 접두사 붙은 env를 "빌드 시점"에 번들 JS에 박아넣는다 - 컨테이너를
# 띄운 뒤(런타임)에 환경변수를 바꿔도 소용없다. 그래서 docker-compose의
# build.args로 넘겨받아서 빌드 전에 고정시켜야 한다.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- serve stage ----
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
