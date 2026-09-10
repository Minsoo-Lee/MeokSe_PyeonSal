# syntax=docker/dockerfile:1

# ---- build stage ----
FROM gradle:8-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true
COPY . .
RUN gradle bootJar --no-daemon -x test

# ---- run stage ----
FROM eclipse-temurin:21-jre-alpine AS run
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]