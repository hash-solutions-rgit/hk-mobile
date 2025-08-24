const { withSettingsGradle } = require('@expo/config-plugins');

module.exports = function withExpoModuleGradlePlugin(config) {
  return withSettingsGradle(config, config => {
    const contents = config.modResults.contents;
    if (!contents.includes('expo-module-gradle-plugin')) {
      config.modResults.contents = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "expo-module-gradle-plugin") {
                useModule("expo.modules:expo-module-gradle-plugin:+")
            }
        }
    }
}
` + contents;
    }
    return config;
  });
};
