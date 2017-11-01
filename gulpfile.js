/*
 The gulpfile for WCM-embedded WRP web apps using the core library combined with bower and gulp.
 You shouldn't have to change this file much, but you could if you wanted.
 Note that this file uses es6 syntax.
 http://gulpjs.com/
 */

const gulp = require('gulp');
const core = require('./bower_components/core/gulp_helper');
const pkg = require('./package.json');

//You should pass options to the createTasks method below
let options = {
  pkg, //pass in the contents of package.json

  //How this app should be embedded in the simulator. Options are: 'full', 'left', or 'right'
  //This is optional, and the default value is 'full'
  embedArea: 'full',

  //If you want to add vars to the preprocessor context, include this option
  //You can add environment-specific vars or general vars
  preprocessorContext: {
    local: {
      SOME_ENV: 'SOME_ENV will have this value in the local build environment'
    },
    dev: {
      SOME_ENV: 'SOME_ENV will have this value in the dev build environment'
    },
    qa: {
      SOME_ENV: 'SOME_ENV will have this value in the qa build environment'
    },
    prod: {
      SOME_ENV: 'SOME_ENV will have this value in the prod build environment'
    },
    SOME_OTHER_ENV: 'this var will be in the context of any environment'
  },

  //If you want to override the environment that the build process uses, specify it here
  //Valid values are: 'local', 'dev', 'qa', 'prod'
  //If you omit this (which you probably should), then the environment will be:
  //'local' when running or building on your machine
  //'dev' when calling gulp deploy:dev
  //'qa' when calling gulp deploy:qa
  //'prod' when calling gulp deploy:prod
  environmentOverride: null
};

//This creates several gulp tasks to use during development:
//default, clean, build, build_with_simulator, run, deploy:dev, deploy:qa, deploy:prod
core.embeddedApp.createTasks(gulp, options);
//FAKING DATA AND CONFIG FILES:
gulp.task('_data', () => {
  return gulp.src(['src/data/graffiti_exemption_config'])
    .pipe(gulp.dest('dist/app_content'));
});