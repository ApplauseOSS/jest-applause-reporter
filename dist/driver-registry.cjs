'use strict';

function recordSessionId(sessionId) {
    const testName = expect.getState().currentTestName;
    if (testName !== undefined) {
        globalThis.driverRegistry.recordSessionId(testName, sessionId);
    }
}
class DriverRegistry {
    providerSessionMapping = {};
    recordSessionId(testCase, sessionId) {
        this.providerSessionMapping[testCase] = [
            sessionId,
            ...(this.providerSessionMapping[testCase] || []),
        ];
    }
    getSessionIdsForTestCase(testCase) {
        return this.providerSessionMapping[testCase] || [];
    }
}

exports.DriverRegistry = DriverRegistry;
exports.recordSessionId = recordSessionId;
//# sourceMappingURL=driver-registry.cjs.map
