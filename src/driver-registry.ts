export function recordSessionId(sessionId: string) {
  const testName = expect.getState().currentTestName;
  if (testName !== undefined) {
    globalThis.driverRegistry.recordSessionId(testName, sessionId);
  }
}

export class DriverRegistry {
  private providerSessionMapping: Record<string, string[]> = {};

  public recordSessionId(testCase: string, sessionId: string): void {
    this.providerSessionMapping[testCase] = [
      sessionId,
      ...(this.providerSessionMapping[testCase] || []),
    ];
  }

  public getSessionIdsForTestCase(testCase: string): string[] {
    return this.providerSessionMapping[testCase] || [];
  }
}
