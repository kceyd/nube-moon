# ---- Etapa 1: compilar con Maven (imagen oficial, no hay que instalar nada) ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Descarga dependencias aparte para aprovechar la caché de Docker (si falla, no pasa nada)
RUN mvn -q -B dependency:go-offline || true
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---- Etapa 2: imagen liviana que solo corre el JAR ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082
# Límite de memoria para que quepan 2 servicios + MySQL en una EC2 pequeña
ENV JAVA_OPTS="-Xms64m -Xmx256m"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
