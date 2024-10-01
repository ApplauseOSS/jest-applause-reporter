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
        void this.reporter.runnerStart();
    }
    async onRunComplete() {
        await this.reporter.runnerEnd();
    }
    onTestCaseStart(_test, _testCaseStartInfo) {
        void this.reporter.startTestCase(_testCaseStartInfo.fullName, _testCaseStartInfo.title, {
            providerSessionIds: globalThis.driverRegistry.getSessionIdsForTestCase(_testCaseStartInfo.fullName),
        });
    }
    onTestCaseResult(_test, _testCaseResult) {
        void this.reporter.submitTestCaseResult(_testCaseResult.fullName, this.mapStatus(_testCaseResult), {
            failureReason: _testCaseResult.failureMessages.join(', '),
            providerSessionGuids: globalThis.driverRegistry.getSessionIdsForTestCase(_testCaseResult.fullName),
        });
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
//# sourceMappingURL=index.cjs.map
