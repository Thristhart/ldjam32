var gulp = require('gulp');
var browserify = require('browserify');
var vss = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gm = require('gulp-gm');
var rename = require('gulp-rename');

function onError(err) {
  console.error(err.toString());
  this.emit('end');
}

gulp.task('browserify', function() {
  return browserify('./index.js')
    .bundle()
    .on('error', onError)
    .pipe(vss('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./build'));
});


gulp.task('flip-images', function() {
  gulp.src('./assets/*.png')
    .pipe(gm(function(gmFile) {
      return gmFile.flop();
    }))
    .pipe(rename({suffix: "_left"}))
    .pipe(gulp.dest('./build/assets'));
});

gulp.task('deploy-js', ['browserify'], function() {
  return gulp.src('./build/*')
      .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32/js'));
});
gulp.task('deploy-static', ['flip-images'], function() {
  gulp.src('./*.html')
    .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32'));
  gulp.src('./*.css')
    .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32'));
  gulp.src('./assets/*')
    .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32/assets'));
  return gulp.src('./build/assets/*')
    .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32/assets'));
});

gulp.task('watch', function() {
  gulp.watch('./*.js', ['deploy-js']);
  return gulp.watch(['./index.html', './style.css'], ['deploy-static']);
});
