'use strict';

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const eslint = require('gulp-eslint');

function isFixed(file) {
	return file.eslint && file.eslint.fixed;
}

gulp.task('eslint', function () {
	return gulp.src(['**/*.js', '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('eslint-fix', function () {
	return gulp.src(['**/*.js', '!node_modules/**'])
		.pipe(eslint({ fix: true }))
		.pipe(eslint.format())
		.pipe(gulpIf(isFixed, gulp.dest('./')))
		.pipe(eslint.failAfterError());
});

gulp.task('build', ['eslint']);