import { ApplauseReporter, TestResultStatus } from 'applause-reporter-common';

class ApplauseJestReporter {
    globalConfig;
    reporter;
    constructor(globalConfig, options) {
        this.globalConfig = globalConfig;
        this.reporter = new ApplauseReporter(options);
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
