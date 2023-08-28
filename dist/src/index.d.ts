import { Reporter, TestCaseResult } from '@jest/reporters';
import { Test } from '@jest/test-result';
import { Circus } from '@jest/types';
import { Config } from 'jest';
import { ApplauseOptions } from './applause-options';
export default class ApplauseReporter implements Reporter {
    globalConfig: Config;
    private readonly TEST_RAIL_CASE_ID_PREFIX;
    private readonly APPLAUSE_CASE_ID_PREFIX;
    private autoapi;
    private testRunId;
    private heartbeat?;
    private heartbeatStarted?;
    private uidToResultIdMap;
    private uidSubmissionMap;
    constructor(globalConfig: Config, options: ApplauseOptions);
    onRunStart(): void;
    onRunComplete(): void;
    onTestCaseStart(_test: Test, _testCaseStartInfo: Circus.TestCaseStartInfo): void;
    onTestCaseResult(_test: Test, _testCaseResult: TestCaseResult): void;
    private runnerStart;
    private startTestResult;
    private submitTestResult;
    private runnerEnd;
    private parseTestCaseName;
    private mapStatus;
}
//# sourceMappingURL=index.d.ts.map