#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const CleanCSS = require('clean-css');
const { minify } = require("terser");
const { transformAsync } = require('@babel/core');

//  File is the first argument if exists, else the default file

let file = process.argv[2] || "./publish-pack.json";

if (!fs.existsSync(file)) {
  console.log("File not found: " + file);
  process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(file, "utf8"));

process.chdir(path.dirname(file));

async function parse() {
  if (settings.css) {
    let customCss = "";

    settings.css.in.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      customCss += content + "\n\n";
    });

    const finalCss = new CleanCSS({ format: 'beautify' }).minify(customCss).styles;
    const outDir = path.normalize(path.dirname(settings.css.out));

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(settings.css.out, finalCss, "utf8");
  }

  if (settings.js) {
    let customJs = "";

    settings.js.in.forEach(file => {
      const content = fs.readFileSync(file, "utf8");
      customJs += content + "\n\n";
    });

    const { code } = await transformAsync(customJs, {
      presets: ['@babel/preset-env']
    });

    const minifiedResult = await minify(code);
    const finalJs = minifiedResult.code || code;

    const outDir = path.dirname(settings.js.out);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(settings.js.out, finalJs, "utf8");
  }

  if (settings.html) {
    fs.copyFileSync(settings.html.in, settings.html.out);
  }
}

parse();