#!/bin/bash

# Get latest version of the `maven-compiler-plugin` plugin
LATEST_COMPILER_PLUGIN_VERSION=$(
  curl -s https://repo1.maven.org/maven2/org/apache/maven/plugins/maven-compiler-plugin/maven-metadata.xml \
| grep -oE '<version>[0-9]+\.[0-9]+(\.[0-9]+)?</version>' \
| sed -E 's/<\/?version>//g' \
| sort -V \
| tail -n 1
)

# Get current version from pom.xml, reading from the `compiler-plugin.version` property
CURRENT_COMPILER_PLUGIN_VERSION=$(cd backend && mvn help:evaluate -Dexpression=compiler-plugin.version -q -DforceStdout)

if [ "$LATEST_COMPILER_PLUGIN_VERSION" != "$CURRENT_COMPILER_PLUGIN_VERSION" ]; then
    echo "The maven-compiler-plugin is outdated. Current version: $CURRENT_COMPILER_PLUGIN_VERSION, Latest version: $LATEST_COMPILER_PLUGIN_VERSION"
    exit 1
else
    echo "The maven-compiler-plugin is up to date. Current version: $CURRENT_COMPILER_PLUGIN_VERSION"
fi

# Get latest version of the `maven-surefire-plugin` plugin
LATEST_SUREFIRE_PLUGIN_VERSION=$(
  curl -s https://repo1.maven.org/maven2/org/apache/maven/plugins/maven-surefire-plugin/maven-metadata.xml \
| grep -oE '<version>[0-9]+\.[0-9]+(\.[0-9]+)?</version>' \
| sed -E 's/<\/?version>//g' \
| sort -V \
| tail -n 1
)

# Get current version from pom.xml, reading from the `surefire-plugin.version` property
CURRENT_SUREFIRE_PLUGIN_VERSION=$(cd backend && mvn help:evaluate -Dexpression=surefire-plugin.version -q -DforceStdout)
if [ "$LATEST_SUREFIRE_PLUGIN_VERSION" != "$CURRENT_SUREFIRE_PLUGIN_VERSION" ]; then
    echo "The maven-surefire-plugin is outdated. Current version: $CURRENT_SUREFIRE_PLUGIN_VERSION, Latest version: $LATEST_SUREFIRE_PLUGIN_VERSION"
    exit 1
else
    echo "The maven-surefire-plugin is up to date. Current version: $CURRENT_SUREFIRE_PLUGIN_VERSION"
fi

# Get latest version of the Quarkus plugin
LATEST_QUARKUS_PLUGIN_VERSION=$(
  curl -s https://repo1.maven.org/maven2/io/quarkus/quarkus-maven-plugin/maven-metadata.xml \
| grep -oE '<version>[0-9]+\.[0-9]+(\.[0-9]+)?</version>' \
| sed -E 's/<\/?version>//g' \
| sort -V \
| tail -n 1
)

# Get current version from pom.xml, reading from the `quarkus.platform.version` property
CURRENT_QUARKUS_PLUGIN_VERSION=$(cd backend && mvn help:evaluate -Dexpression=quarkus.platform.version -q -DforceStdout)
if [ "$LATEST_QUARKUS_PLUGIN_VERSION" != "$CURRENT_QUARKUS_PLUGIN_VERSION" ]; then
    echo "The quarkus-maven-plugin is outdated. Current version: $CURRENT_QUARKUS_PLUGIN_VERSION, Latest version: $LATEST_QUARKUS_PLUGIN_VERSION"
    exit 1
else
    echo "The quarkus-maven-plugin is up to date. Current version: $CURRENT_QUARKUS_PLUGIN_VERSION"
fi  