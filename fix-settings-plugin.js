const { withSettingsGradle } = require('@expo/config-plugins');

const RESOLUTION = `
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "expo-module-gradle-plugin") {
                useModule("expo.modules:expo-module-gradle-plugin:+")
            }
        }
    }`;

module.exports = function withFixSettingsGradle(config) {
  return withSettingsGradle(config, (cfg) => {
    let s = cfg.modResults.contents || '';

    // 1) Remove extra pluginManagement blocks (keep only the first)
    const blocks = [...s.matchAll(/^\s*pluginManagement\s*\{[\s\S]*?\n\}/gm)];
    if (blocks.length > 1) {
      for (let i = 1; i < blocks.length; i++) {
        s = s.replace(blocks[i][0], '');
      }
    }

    // 2) Ensure our resolutionStrategy lives inside the single block
    if (!s.includes('expo-module-gradle-plugin')) {
      s = s.replace(/^\s*pluginManagement\s*\{/, (m) => `${m}\n${RESOLUTION}\n`);
      // Alternatively (no template strings):
      // s = s.replace(/^\s*pluginManagement\s*\{/, (m) => m + "\n" + RESOLUTION + "\n");
    }

    cfg.modResults.contents = s;
    return cfg;
  });
};