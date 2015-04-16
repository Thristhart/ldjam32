var gulp = require('gulp');
var browserify = require('browserify');
var vss = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

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
    .pipe(gulp.dest('./build'));
});

gulp.task('deploy-js', ['browserify'], function() {
  return gulp.src('./build/*')
      .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32/js'));
});
gulp.task('deploy-static', function() {
  gulp.src('./*.html')
    .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32'));
  return gulp.src('./*.css')
    .pipe(gulp.dest('/srv/http/tom.shea.at/ldjam32'));
});

gulp.task('watch', function() {
  gulp.watch('./index.js', ['deploy-js']);
  return gulp.watch(['./index.html', './style.css'], ['deploy-static']);
});
