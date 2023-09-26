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

export { globalSetup as default };
//# sourceMappingURL=global-setup.mjs.map
