const glob = require("glob");
const fs = require("fs");
const path = require("path");
const i18nResourcesPath = "./dist/libs/i18n";


function generateLocales({
  localesSrc = "./locales",
  localesDest = i18nResourcesPath,
  filename = "resources.json",
} = {}) {
  // CONSTANTS
  const files = glob.sync(`${localesSrc}/**/*.json`, {});
  const reg = /\/(\w+)\/(\w+)\.json/gm;
  const resources = {};

  if (files) {
    files.forEach(f => {
      if (f.match(reg)) {
        const match = reg.exec(f);
        
        if (match) {
          const lng = match[1];
          const ns = match[2];
          if (!resources[lng]) {
            resources[lng] = {};
          }
          delete require.cache[require.resolve(f)]
          resources[lng][ns] = require(f);
        }
      }
    });
  }

  // GENERATE LOCALE RESOURCES FILE
  fs.writeFileSync(path.join(localesDest, filename), JSON.stringify(resources));
}


if (process.argv) {
  if (process.argv[2] === "run") {
    generateLocales();
  }
}


module.exports = generateLocales;