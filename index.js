const fs = require("fs");
const fs = require("path");
const settings = JSON.parse(fs.readFileSync(".publish-pack.json", "utf8"));
const CleanCSS = require('clean-css');
const { minify } = require("terser");
const { transformAsync } = require('@babel/core');

async function parse() {
  if (settings.css) {
    let customCss = "";

    settings.css.in.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      customCss += content + "\n\n";
    });

    const finalCss = new CleanCSS({ format: 'beautify' }).minify(newStyle).styles;
    fs.writeFileSync(settings.css.out, finalCss, "utf8");
  }

  if (settings.js) {
    let customJs = "";

    settings.js.in.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      customJs += content + "\n\n";
    });

    const { code } = await transformAsync(scriptCode, {
      presets: ['@babel/preset-env']
    });

    const minifiedResult = await minify(code);
    const finalJs = minifiedResult.code || code;

    fs.writeFileSync(settings.js.out, finalJs, "utf8");
  }

  if (settings.html) {
    fs.copyFileSync(settings.html.in, settings.html.out);
  }
}

parse();