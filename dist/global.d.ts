declare function recordSessionId(sessionId: string): void;
declare class DriverRegistry {
    private providerSessionMapping;
    recordSessionId(testCase: string, sessionId: string): void;
    getSessionIdsForTestCase(testCase: string): string[];
}

export { DriverRegistry, recordSessionId };
