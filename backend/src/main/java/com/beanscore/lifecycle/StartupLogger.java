package com.beanscore.lifecycle;

import io.quarkus.runtime.Startup;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import java.lang.management.ManagementFactory;
import org.eclipse.microprofile.config.ConfigProvider;
import org.jboss.logging.Logger;

@Startup
@ApplicationScoped
public class StartupLogger {

  private static final Logger logger = Logger.getLogger(StartupLogger.class);

  @PostConstruct
  void logEarlyConfig() {
    logger.infof("===========================================");
    logger.infof("BeanScore API - EARLY CONFIG CHECK");
    logger.infof("===========================================");

    logger.infof("ENV: QUARKUS_PROFILE = %s", System.getenv("QUARKUS_PROFILE"));
    logger.infof("ENV: QUARKUS_DATASOURCE_JDBC_URL = %s", System.getenv("QUARKUS_DATASOURCE_JDBC_URL"));
    logger.infof("ENV: QUARKUS_DATASOURCE_USERNAME = %s", System.getenv("QUARKUS_DATASOURCE_USERNAME"));

    String envPassword = System.getenv("QUARKUS_DATASOURCE_PASSWORD");
    if (envPassword != null && !envPassword.isEmpty()) {
      logger.infof("ENV: QUARKUS_DATASOURCE_PASSWORD = ***%s (length: %d)",
          envPassword.substring(Math.max(0, envPassword.length() - 3)),
          envPassword.length());
    } else {
      logger.infof("ENV: QUARKUS_DATASOURCE_PASSWORD = not-set");
    }

    try {
      String profile = ConfigProvider.getConfig().getOptionalValue("quarkus.profile", String.class).orElse("unknown");
      String url = ConfigProvider.getConfig().getOptionalValue("quarkus.datasource.jdbc.url", String.class).orElse("not-set");
      String username = ConfigProvider.getConfig().getOptionalValue("quarkus.datasource.username", String.class).orElse("not-set");

      logger.infof("CONFIG: quarkus.profile = %s", profile);
      logger.infof("CONFIG: quarkus.datasource.jdbc.url = %s", url);
      logger.infof("CONFIG: quarkus.datasource.username = %s", username);
    } catch (Exception e) {
      logger.warnf("Could not read config values: %s", e.getMessage());
    }

    logger.infof("===========================================");
  }

  void onStart(@Observes StartupEvent ev) {
    long startTime = ManagementFactory.getRuntimeMXBean().getStartTime();
    long now = System.currentTimeMillis();
    
    double durationSeconds = (now - startTime) / 1000.0;
    String apiVersion = System.getenv("API_VERSION");

    logger.infof("===========================================");
    logger.infof("BeanScore API version %s Started Successfully in %.3f seconds!", apiVersion, durationSeconds);
    logger.infof("===========================================");
  }
}
