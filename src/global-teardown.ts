import { DriverRegistry } from './driver-registry.ts';

export default function globalTeardown() {
  globalThis.driverRegistry = new DriverRegistry();
}
