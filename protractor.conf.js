exports.config = {
    chromeDriver : 'node_modules/chromedriver/lib/chromedriver/chromedriver',
    baseUrl: 'http://localhost:8082',
    specs: ['e2e/**/*.spec.js'],
    directConnect: true,
    exclude: [],
    multiCapabilities: [{
        browserName: 'chrome'
    }],
    allScriptsTimeout: 110000,
    getPageTimeout: 100000,
    framework: 'jasmine2',
    jasmineNodeOpts: {
        isVerbose: false,
        showColors: true,
        includeStackTrace: false,
        defaultTimeoutInterval: 400000
    },
    plugins: [{
        package: 'protractor-console-plugin',
        failOnWarning: false,
        failOnError: false, // TODO: turn back on when console errors are fixed
        logWarnings: true,
        exclude: []
    }],
    onPrepare: function() {
        browser.manage().window().setSize(800, 600);
    }
};