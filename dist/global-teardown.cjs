'use strict';

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

function globalTeardown() {
    globalThis.driverRegistry = new DriverRegistry();
}

module.exports = globalTeardown;
//# sourceMappingURL=global-teardown.cjs.map
