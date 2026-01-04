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

# Copy source code
COPY --chown=quarkus:quarkus src /code/src

# Build native executable
USER quarkus
RUN ./mvnw package -Pnative -DskipTests

####
# Runtime stage - Minimal container
####
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.3

WORKDIR /work/

# Install curl for healthchecks
USER root
RUN microdnf install -y curl-minimal && microdnf clean all

# Copy the native executable from build stage
COPY --from=build /code/target/*-runner /work/application

# Set permissions
RUN chmod 775 /work/application
USER 1001

# Expose port
EXPOSE 8080

# Set profile via environment variable (better for native images)
ENV QUARKUS_PROFILE=prod

# Run the native application
CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
