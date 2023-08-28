import { AutoApi, TestRunHeartbeatService, TestResultStatus } from 'auto-api-client-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

class ApplauseReporter {
    constructor(globalConfig, options) {
        this.globalConfig = globalConfig;
        this.TEST_RAIL_CASE_ID_PREFIX = 'TestRail-';
        this.APPLAUSE_CASE_ID_PREFIX = 'Applause-';
        this.testRunId = Promise.resolve(0);
        this.uidToResultIdMap = {};
        this.uidSubmissionMap = {};
        this.autoapi = new AutoApi({
            clientConfig: { apiKey: options.apiKey, baseUrl: options.baseUrl },
            productId: options.productId,
            testRailOptions: options.testRail,
        });
    }
    onRunStart() {
        void this.runnerStart([]);
    }
    onRunComplete() {
        void this.runnerEnd();
    }
    onTestCaseStart(_test, _testCaseStartInfo) {
        void this.startTestResult(_testCaseStartInfo.fullName, _testCaseStartInfo.fullName);
    }
    onTestCaseResult(_test, _testCaseResult) {
        console.log('Test Case Result');
        void this.submitTestResult(_testCaseResult.fullName, this.mapStatus(_testCaseResult));
    }
    runnerStart(tests) {
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
    startTestResult(id, testCaseName) {
        const parsedTestCase = this.parseTestCaseName(testCaseName);
        this.uidToResultIdMap[id] = this.testRunId
            ?.then(runId => this.autoapi.startTestCase({
            testCaseName: parsedTestCase.testCaseName,
            testCaseId: parsedTestCase.testRailTestCaseId,
            testRunId: runId,
            providerSessionIds: [],
        }))
            .then(res => {
            return res.data.testResultId;
        });
    }
    submitTestResult(id, status, errorMessage) {
        this.uidSubmissionMap[id] = this.uidToResultIdMap[id]?.then(resultId => this.autoapi.submitTestResult({
            status: status,
            testResultId: resultId,
            failureReason: errorMessage,
        }));
    }
    async runnerEnd() {
        // Wait for the test run to be created and the heartbeat to be started
        await this.testRunId;
        await this.heartbeatStarted;
        // End the heartbeat
        await this.heartbeat?.end();
        let resultIds = [];
        const valuePromises = Object.values(this.uidToResultIdMap);
        // Wait for all results to be created
        void (await Promise.all(valuePromises)
            .then(vals => (resultIds = vals == null ? [] : vals))
            .catch((reason) => {
            console.error(`Unable to retrieve Applause TestResultIds ${reason.message}`);
        }));
        const resultPromises = Object.values(this.uidSubmissionMap);
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
            writeFileSync(join(outputPath, 'providerUrls.txt'), JSON.stringify(jsonArray, null, 1));
        }
    }
    parseTestCaseName(testCaseName) {
        // Split the name on spaces. We will reassemble after parsing out the other ids
        const tokens = testCaseName.split(' ');
        let testRailTestCaseId;
        let applauseTestCaseId;
        tokens.forEach(token => {
            if (token?.startsWith(this.TEST_RAIL_CASE_ID_PREFIX)) {
                if (testRailTestCaseId !== undefined) {
                    console.warn('Multiple TestRail case ids detected in testCase name');
                }
                testRailTestCaseId = token.substring(this.TEST_RAIL_CASE_ID_PREFIX.length);
            }
            else if (token?.startsWith(this.APPLAUSE_CASE_ID_PREFIX)) {
                if (applauseTestCaseId !== undefined) {
                    console.warn('Multiple Applause case ids detected in testCase name');
                }
                applauseTestCaseId = token.substring(this.APPLAUSE_CASE_ID_PREFIX.length);
            }
        });
        return {
            applauseTestCaseId,
            testRailTestCaseId,
            testCaseName: tokens
                .filter(token => token !==
                `${this.TEST_RAIL_CASE_ID_PREFIX}${testRailTestCaseId || ''}`)
                .filter(token => token !==
                `${this.APPLAUSE_CASE_ID_PREFIX}${applauseTestCaseId || ''}`)
                .join(' '),
        };
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

export { ApplauseReporter as default };
//# sourceMappingURL=index.mjs.map
