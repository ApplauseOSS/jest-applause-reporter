import { DriverRegistry } from './driver-registry.ts';

export default function globalSetup() {
  globalThis.driverRegistry = new DriverRegistry();
}
