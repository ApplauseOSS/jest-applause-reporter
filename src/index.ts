import { Reporter, TestCaseResult } from '@jest/reporters';
import { Test } from '@jest/test-result';
import { Circus } from '@jest/types';
import { Config } from 'jest';
import {
  ApplauseConfig,
  ApplauseReporter,
  TestResultStatus,
} from 'applause-reporter-common';

export default class ApplauseJestReporter implements Reporter {
  private reporter: ApplauseReporter;

  constructor(
    public globalConfig: Config,
    options: ApplauseConfig
  ) {
    this.reporter = new ApplauseReporter(options);
  }

  onRunStart(): void {
    this.reporter.runnerStart();
  }

  async onRunComplete(): Promise<void> {
    await this.reporter.runnerEnd();
  }

  onTestCaseStart(
    _test: Test,
    _testCaseStartInfo: Circus.TestCaseStartInfo
  ): void {
    this.reporter.startTestCase(
      _testCaseStartInfo.fullName,
      _testCaseStartInfo.title
    );
  }

  onTestCaseResult(_test: Test, _testCaseResult: TestCaseResult): void {
    this.reporter.submitTestCaseResult(
      _testCaseResult.fullName,
      this.mapStatus(_testCaseResult)
    );
  }

  private mapStatus(result: TestCaseResult): TestResultStatus {
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
        throw new Error(
          'yo, you shouldnt use this for tests that arent in a status auto-api doesnt support'
        );
    }
  }
}
