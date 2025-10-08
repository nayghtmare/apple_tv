const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const terser = require("gulp-terser");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
const bs = require("browser-sync").create();
const gulpIf = require("gulp-if");

const paths = {
  html: "src/*.html",
  styles: "src/styles/styles.scss",
  scripts: "src/scripts/app.js",
  assets: "src/assets/**/*"
};

const isProd = process.env.NODE_ENV === "production";

// Limpa dist/
function clean() {
  return del(["dist"]);
}

// HTML (copiar + minificar em prod)
function html() {
  return gulp
    .src(paths.html)
    .pipe(gulpIf(isProd, htmlmin({ collapseWhitespace: true, removeComments: true })))
    .pipe(gulp.dest("dist"))
    .pipe(bs.stream());
}

// Styles (SCSS -> CSS)
function styles() {
  return gulp
    .src(paths.styles)
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(sass.sync({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(gulpIf(isProd, cleanCSS()))
    .pipe(gulpIf(!isProd, sourcemaps.write("./maps")))
    .pipe(gulp.dest("dist"))
    .pipe(bs.stream());
}

// Scripts (minifica em prod)
function scripts() {
  return gulp
    .src(paths.scripts)
    .pipe(gulpIf(!isProd, sourcemaps.init()))
    .pipe(gulpIf(isProd, terser()))
    .pipe(gulpIf(!isProd, sourcemaps.write("./maps")))
    .pipe(gulp.dest("dist"))
    .pipe(bs.stream());
}

// Copia assets (se usar imagens locais)
function assets() {
  return gulp.src(paths.assets, { allowEmpty: true }).pipe(gulp.dest("dist/assets"));
}

function serve() {
  bs.init({
    server: { baseDir: "dist" },
    open: false,
    ui: false,
    ghostMode: false
  });

  gulp.watch("src/styles/*.scss", styles);
  gulp.watch(paths.scripts, scripts);
  gulp.watch(paths.html, html);
  gulp.watch(paths.assets, assets);
}

const build = gulp.series(clean, gulp.parallel(html, styles, scripts, assets));
const dev = gulp.series(build, serve);

exports.clean = clean;
exports.build = build;
exports.dev = dev;
exports.default = dev;
