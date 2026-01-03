package com.beanscore.lifecycle;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class StartupLogger {

  private static final Logger logger = Logger.getLogger(StartupLogger.class);

  @ConfigProperty(name = "quarkus.profile")
  String profile;

  @ConfigProperty(name = "quarkus.datasource.username", defaultValue = "not-set")
  String datasourceUsername;

  @ConfigProperty(name = "quarkus.datasource.jdbc.url", defaultValue = "not-set")
  String datasourceUrl;

  void onStart(@Observes StartupEvent ev) {
    logger.infof("===========================================");
    logger.infof("BeanScore API Starting");
    logger.infof("Active Profile: %s", profile);
    logger.infof("Datasource URL: %s", datasourceUrl);
    logger.infof("Datasource User: %s", datasourceUsername);
    logger.infof("===========================================");
  }
}
