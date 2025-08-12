import { Reporter, TestCaseResult } from '@jest/reporters';
import { Test } from '@jest/test-result';
import { Circus } from '@jest/types';
import { Config } from 'jest';
import {
  ApplauseConfig,
  ApplauseReporter,
  TestResultStatus,
  loadConfig,
} from 'applause-reporter-common';

export default class ApplauseJestReporter implements Reporter {
  private reporter: ApplauseReporter;

  constructor(
    public globalConfig: Config,
    options: Partial<ApplauseConfig>
  ) {
    const config = loadConfig({
      properties: options,
    });
    this.reporter = new ApplauseReporter(config);
  }

  onRunStart(): void {
    void this.reporter.runnerStart();
  }

  async onRunComplete(): Promise<void> {
    await this.reporter.runnerEnd();
  }

  onTestCaseStart(
    _test: Test,
    _testCaseStartInfo: Circus.TestCaseStartInfo
  ): void {
    void this.reporter.startTestCase(
      _testCaseStartInfo.fullName,
      _testCaseStartInfo.title,
      {
        providerSessionIds: globalThis.driverRegistry.getSessionIdsForTestCase(
          _testCaseStartInfo.fullName
        ),
      }
    );
  }

cleanErrorMessage(str?: string): string | undefined {
    // eslint-disable-next-line no-control-regex
    return str?.replace(/\x1B\[[0-9;]*m/g, '');
}
  onTestCaseResult(_test: Test, _testCaseResult: TestCaseResult): void {
    
    // 1. Map over the failure messages and clean each one.
    const cleanedMessages = _testCaseResult.failureMessages.map(msg => this.cleanErrorMessage(msg) || '');

    // 2. Join the cleaned messages with a newline for better readability.
    const failureReason = cleanedMessages.join('\n');

    void this.reporter.submitTestCaseResult(
      _testCaseResult.fullName,
      this.mapStatus(_testCaseResult),
      {
        // 3. Use the fully cleaned and formatted string.
        failureReason: failureReason,
        providerSessionGuids:
          globalThis.driverRegistry.getSessionIdsForTestCase(
            _testCaseResult.fullName
          ),
      }
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
