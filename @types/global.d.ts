type DriverRegistry = {
    recordSessionId(testCase: string, sessionId: string): void;
    getSessionIdsForTestCase(testCase: string): string[];
}
declare module globalThis {
    var driverRegistry: DriverRegistry;
}
