package com.beanscore.health;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

@Readiness
@ApplicationScoped
public class ConfigurationHealthCheck implements HealthCheck {

    @ConfigProperty(name = "quarkus.profile")
    String profile;

    @ConfigProperty(name = "quarkus.datasource.username", defaultValue = "not-set")
    String datasourceUsername;

    @ConfigProperty(name = "quarkus.datasource.jdbc.url", defaultValue = "not-set")
    String datasourceUrl;

    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.named("configuration")
                .up()
                .withData("profile", profile)
                .withData("datasource.username", datasourceUsername)
                .withData("datasource.url", datasourceUrl)
                .build();
    }
}
