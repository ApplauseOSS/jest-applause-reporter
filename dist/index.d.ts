import { Reporter, TestCaseResult } from '@jest/reporters';
import { Test } from '@jest/test-result';
import { Circus } from '@jest/types';
import { Config } from 'jest';
import { ApplauseConfig } from 'applause-reporter-common';

declare class ApplauseJestReporter implements Reporter {
    globalConfig: Config;
    private reporter;
    constructor(globalConfig: Config, options: Partial<ApplauseConfig>);
    onRunStart(): void;
    onRunComplete(): Promise<void>;
    onTestCaseStart(_test: Test, _testCaseStartInfo: Circus.TestCaseStartInfo): void;
    onTestCaseResult(_test: Test, _testCaseResult: TestCaseResult): void;
    private mapStatus;
}

export { ApplauseJestReporter as default };
