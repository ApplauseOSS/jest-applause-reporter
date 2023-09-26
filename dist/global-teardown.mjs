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

export { globalTeardown as default };
//# sourceMappingURL=global-teardown.mjs.map
