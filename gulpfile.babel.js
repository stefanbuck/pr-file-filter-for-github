// generated on 2016-06-30 using generator-chrome-extension 0.5.6
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import browserify from 'browserify';
import babelify from 'babelify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    'app/images/**',
    '!app/scripts.babel',
    '!app/*.json',
  ], {
    base: 'app',
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
  const options = {
    env: {
      es6: true
    },
    parserOptions: {
      sourceType: 'module',
      ecmaFeatures: {
        experimentalObjectRestSpread: true,
      },
    },
  };

  return gulp.src('app/scripts.babel/**/*.js')
    .pipe($.eslint(options))
    .pipe($.eslint.format());
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
    .pipe($.chromeManifest({
      buildnumber: true,
  }))
  .pipe($.if('*.js', $.sourcemaps.init()))
  .pipe($.if('*.js', $.sourcemaps.write('.')))
  .pipe(gulp.dest('dist'));
});

gulp.task('babel', () => {
  var bundler = browserify({
    entries: './app/scripts.babel/app.js',
    debug: true
  });
  bundler.transform(babelify, {
    presets: ['es2015'],
    plugins: ['transform-object-rest-spread']
  });
  bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint', 'babel'], () => {
  gulp.watch('app/scripts.babel/**/*.js', ['lint', 'babel']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build', ['clean'], (cb) => {
  runSequence(
    'lint', 'babel', 'chromeManifest',
    ['extras'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
