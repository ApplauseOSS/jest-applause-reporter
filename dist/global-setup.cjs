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

function globalSetup() {
    globalThis.driverRegistry = new DriverRegistry();
}

module.exports = globalSetup;
//# sourceMappingURL=global-setup.cjs.map
