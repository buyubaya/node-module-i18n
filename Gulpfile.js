const { src, dest, watch, series, del } = require('gulp');
const generateLocales = require("./locales/generate_locales");
var s = require('stream');
const fs = require("fs");


const i18nSrcPath = "./src/libs/i18n";


function watchFolder() {
  return watch('./locales/**/*.json', copyFolder);
}

function copyFolder(cb) {
  generateLocales({
    localesDest: i18nSrcPath
  });
  cb();
}


exports.default = watchFolder;