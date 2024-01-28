import gulp from 'gulp';
import concat from 'gulp-concat';

import webpack_stream from 'webpack-stream';
import webpack from 'webpack';
import WPConfig from './webpack.config.js';
import linkBuilder from './linkBuilder.js';


async function javascript(cb) {
  await linkBuilder.build();
  return webpack_stream(WPConfig, webpack)
        .pipe(gulp.dest(`dist`));
}
function css() {
  return gulp.src("src/css/**/*.css")
    .pipe(gulp.src("src/js/**/*.css"))
    .pipe(concat('main_min.css'))
    .pipe(gulp.dest("dist"));
}
function images() {
  return gulp.src('src/images/*')
        .pipe(gulp.dest('dist/images'))
}

function miscellanious() {
  return gulp.src('src/index.html')
        .pipe(gulp.src('src/manifest.json'))
        .pipe(gulp.dest('dist'))
}


function wrapper() {
  let out = gulp.series(javascript, css, images, miscellanious);
  setTimeout(() => process.exit(), 2000);
  return out;
}
export default wrapper()