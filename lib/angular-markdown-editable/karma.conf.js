module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: [
      'lib/angular/angular.js',
      'lib/angular-mocks/angular-mocks.js',
      'lib/showdown/src/showdown.js',
      'angular-markdown-editable.js',
      'unit-tests.js'
    ],

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher'
    ],

    exclude: [],

    port: 9876,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['Chrome'],

    singleRun: false
  });
};