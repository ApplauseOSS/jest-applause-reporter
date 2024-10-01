import { loadConfig, ApplauseReporter, TestResultStatus } from 'applause-reporter-common';

class ApplauseJestReporter {
    globalConfig;
    reporter;
    constructor(globalConfig, options) {
        this.globalConfig = globalConfig;
        const config = loadConfig({
            properties: options,
        });
        this.reporter = new ApplauseReporter(config);
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
                return TestResultStatus.PASSED;
            case 'disabled':
                return TestResultStatus.SKIPPED;
            case 'failed':
                return TestResultStatus.FAILED;
            case 'skipped':
                return TestResultStatus.SKIPPED;
            default:
                throw new Error('yo, you shouldnt use this for tests that arent in a status auto-api doesnt support');
        }
    }
}

export { ApplauseJestReporter as default };
//# sourceMappingURL=index.mjs.map
