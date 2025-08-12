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
    cleanErrorMessage(str) {
        // eslint-disable-next-line no-control-regex
        return str?.replace(/\x1B\[[0-9;]*m/g, '');
    }
    onTestCaseResult(_test, _testCaseResult) {
        // 1. Map over the failure messages and clean each one.
        const cleanedMessages = _testCaseResult.failureMessages.map(msg => this.cleanErrorMessage(msg) || '');
        // 2. Join the cleaned messages with a newline for better readability.
        const failureReason = cleanedMessages.join('\n');
        void this.reporter.submitTestCaseResult(_testCaseResult.fullName, this.mapStatus(_testCaseResult), {
            // 3. Use the fully cleaned and formatted string.
            failureReason: failureReason,
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
