var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
    console.log('default gulp');
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("./js/"));
});


gulp.task("build", function () {
    console.log('build ts');
    gulp.src('./ts/*.ts')
        .pipe(tsProject())
        .js.pipe(gulp.dest('./js'))
});
