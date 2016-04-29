'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');

var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config.js');

var DEST = 'dist/';
var DEST_CSS = 'dist/css'

gulp.task('webpack', function() {
	return gulp.src('./src/index.js')
		.pipe(webpack(webpackConfig))
		//输出未压缩JS
    .pipe(gulp.dest(DEST))
    //压缩JS
    .pipe(uglify())
    //重命名为.min.js
    .pipe(rename({ extname: '.min.js' }))
    //为min.js创建source map文件
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./'))
    //输出压缩后的JS
    .pipe(gulp.dest(DEST));
});

gulp.task('less', function() {
	return gulp.src('./src/less/*.less')
		.pipe(less())
		.pipe(rename('react-bootstrap-datatable.css'))
    .pipe(gulp.dest(DEST_CSS))
    .pipe(minifyCss())
    .pipe(rename('react-bootstrap-datatable.min.css'))
    .pipe(gulp.dest(DEST_CSS))
});

gulp.task('clean', function() {
	return gulp.src(DEST, {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function() {
  gulp.run('webpack', 'less');
});