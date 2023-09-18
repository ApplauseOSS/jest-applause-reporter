'use strict';

var applauseReporterCommon = require('applause-reporter-common');

class ApplauseJestReporter {
    globalConfig;
    reporter;
    constructor(globalConfig, options) {
        this.globalConfig = globalConfig;
        const config = applauseReporterCommon.loadConfig({
            properties: options,
        });
        this.reporter = new applauseReporterCommon.ApplauseReporter(config);
    }
    onRunStart() {
        this.reporter.runnerStart();
    }
    async onRunComplete() {
        await this.reporter.runnerEnd();
    }
    onTestCaseStart(_test, _testCaseStartInfo) {
        this.reporter.startTestCase(_testCaseStartInfo.fullName, _testCaseStartInfo.title);
    }
    onTestCaseResult(_test, _testCaseResult) {
        this.reporter.submitTestCaseResult(_testCaseResult.fullName, this.mapStatus(_testCaseResult));
    }
    mapStatus(result) {
        switch (result.status) {
            case 'passed':
                return applauseReporterCommon.TestResultStatus.PASSED;
            case 'disabled':
                return applauseReporterCommon.TestResultStatus.SKIPPED;
            case 'failed':
                return applauseReporterCommon.TestResultStatus.FAILED;
            case 'skipped':
                return applauseReporterCommon.TestResultStatus.SKIPPED;
            default:
                throw new Error('yo, you shouldnt use this for tests that arent in a status auto-api doesnt support');
        }
    }
}

module.exports = ApplauseJestReporter;
//# sourceMappingURL=index.js.map
