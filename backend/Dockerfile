####
# This Dockerfile builds a native executable using GraalVM
####

# Build stage
FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21 AS build

# Set working directory
WORKDIR /code

# Copy Maven wrapper and pom.xml
COPY --chown=quarkus:quarkus mvnw /code/mvnw
COPY --chown=quarkus:quarkus .mvn /code/.mvn
COPY --chown=quarkus:quarkus pom.xml /code/

# Download dependencies (cached layer)
USER quarkus
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY --chown=quarkus:quarkus src /code/src

# Build native executable
RUN ./mvnw package -Pnative -DskipTests

####
# Runtime stage - Minimal container
####
FROM quay.io/quarkus/quarkus-micro-image:2.0

WORKDIR /work/

# Copy the native executable from build stage
COPY --from=build /code/target/*-runner /work/application

# Set permissions
RUN chmod 775 /work/application

# Expose port
EXPOSE 8080

# Run the native application
CMD ["./application", "-Dquarkus.profile=prod", "-Dquarkus.http.host=0.0.0.0"]
