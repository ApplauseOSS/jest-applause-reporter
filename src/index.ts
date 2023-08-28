import { Reporter, TestCaseResult } from '@jest/reporters';
import { Test } from '@jest/test-result';
import { Circus } from '@jest/types';
import { Config } from 'jest';
import { ApplauseOptions } from './applause-options';
import {
  AutoApi,
  TestResultStatus,
  TestRunHeartbeatService,
} from 'auto-api-client-js';
import { writeFileSync } from 'fs';
import { join as pathJoin } from 'path';

export default class ApplauseReporter implements Reporter {
  private readonly TEST_RAIL_CASE_ID_PREFIX: string = 'TestRail-';
  private readonly APPLAUSE_CASE_ID_PREFIX: string = 'Applause-';

  private autoapi: AutoApi;
  private testRunId: Promise<number> = Promise.resolve(0);
  private heartbeat?: TestRunHeartbeatService;
  private heartbeatStarted?: Promise<void>;
  private uidToResultIdMap: Record<string, Promise<number>> = {};
  private uidSubmissionMap: Record<string, Promise<void>> = {};

  constructor(public globalConfig: Config, options: ApplauseOptions) {
    this.autoapi = new AutoApi({
      clientConfig: { apiKey: options.apiKey, baseUrl: options.baseUrl },
      productId: options.productId,
      testRailOptions: options.testRail,
    });
  }

  onRunStart(): void {
    void this.runnerStart([]);
  }

  onRunComplete(): void {
    void this.runnerEnd();
  }

  onTestCaseStart(
    _test: Test,
    _testCaseStartInfo: Circus.TestCaseStartInfo
  ): void {
    void this.startTestResult(
      _testCaseStartInfo.fullName,
      _testCaseStartInfo.fullName
    );
  }

  onTestCaseResult(_test: Test, _testCaseResult: TestCaseResult): void {
    console.log('Test Case Result');
    void this.submitTestResult(
      _testCaseResult.fullName,
      this.mapStatus(_testCaseResult)
    );
  }

  private runnerStart(tests: string[]): void {
    this.testRunId = this.autoapi
      .startTestRun({
        tests,
      })
      .then(response => {
        const runId = response.data.runId;
        console.log('Test Run %d initialized', runId);
        this.heartbeat = new TestRunHeartbeatService(runId, this.autoapi);
        this.heartbeatStarted = this.heartbeat.start();
        return runId;
      });
  }

  private startTestResult(id: string, testCaseName: string): void {
    const parsedTestCase = this.parseTestCaseName(testCaseName);
    this.uidToResultIdMap[id] = this.testRunId
      ?.then(runId =>
        this.autoapi.startTestCase({
          testCaseName: parsedTestCase.testCaseName,
          testCaseId: parsedTestCase.testRailTestCaseId,
          testRunId: runId,
          providerSessionIds: [],
        })
      )
      .then(res => {
        return res.data.testResultId;
      });
  }

  private submitTestResult(
    id: string,
    status: TestResultStatus,
    errorMessage?: string
  ): void {
    this.uidSubmissionMap[id] = this.uidToResultIdMap[id]?.then(resultId =>
      this.autoapi.submitTestResult({
        status: status,
        testResultId: resultId,
        failureReason: errorMessage,
      })
    );
  }

  private async runnerEnd(): Promise<void> {
    // Wait for the test run to be created and the heartbeat to be started
    await this.testRunId;
    await this.heartbeatStarted;
    // End the heartbeat
    await this.heartbeat?.end();
    let resultIds: number[] = [];
    const valuePromises: Promise<number>[] = Object.values(
      this.uidToResultIdMap
    );

    // Wait for all results to be created
    void (await Promise.all(valuePromises)
      .then(vals => (resultIds = vals == null ? [] : vals))
      .catch((reason: Error) => {
        console.error(
          `Unable to retrieve Applause TestResultIds ${reason.message}`
        );
      }));
    const resultPromises: Promise<void>[] = Object.values(
      this.uidSubmissionMap
    );

    // Wait for the results to be submitted
    void (await Promise.all(resultPromises));

    // Finally, end the test run
    await this.autoapi.endTestRun((await this.testRunId) || 0);

    // Fetch the provider session asset links
    const resp = await this.autoapi.getProviderSessionLinks(resultIds);
    const jsonArray = resp.data || [];
    if (jsonArray.length > 0) {
      console.info(JSON.stringify(jsonArray));
      // this is the wdio.conf outputDir
      const outputPath = '.';
      writeFileSync(
        pathJoin(outputPath, 'providerUrls.txt'),
        JSON.stringify(jsonArray, null, 1)
      );
    }
  }

  private parseTestCaseName(testCaseName: string): ParsedTestCaseName {
    // Split the name on spaces. We will reassemble after parsing out the other ids
    const tokens = testCaseName.split(' ');
    let testRailTestCaseId: string | undefined;
    let applauseTestCaseId: string | undefined;
    tokens.forEach(token => {
      if (token?.startsWith(this.TEST_RAIL_CASE_ID_PREFIX)) {
        if (testRailTestCaseId !== undefined) {
          console.warn('Multiple TestRail case ids detected in testCase name');
        }
        testRailTestCaseId = token.substring(
          this.TEST_RAIL_CASE_ID_PREFIX.length
        );
      } else if (token?.startsWith(this.APPLAUSE_CASE_ID_PREFIX)) {
        if (applauseTestCaseId !== undefined) {
          console.warn('Multiple Applause case ids detected in testCase name');
        }
        applauseTestCaseId = token.substring(
          this.APPLAUSE_CASE_ID_PREFIX.length
        );
      }
    });
    return {
      applauseTestCaseId,
      testRailTestCaseId,
      testCaseName: tokens
        .filter(
          token =>
            token !==
            `${this.TEST_RAIL_CASE_ID_PREFIX}${testRailTestCaseId || ''}`
        )
        .filter(
          token =>
            token !==
            `${this.APPLAUSE_CASE_ID_PREFIX}${applauseTestCaseId || ''}`
        )
        .join(' '),
    };
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

interface ParsedTestCaseName {
  testCaseName: string;
  testRailTestCaseId?: string;
  applauseTestCaseId?: string;
}
