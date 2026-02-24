import { NativeStructLayout } from './native-structs-from-js.js';
import { WasmModuleBase } from './runtimes/wasm-module-interfaces.js';
import { CppMemoryWriter } from './struct-write.js';

export interface RunData {
  // inputs
  satellitesPointer: number;
  satellitesCount: number;
  jdaysPointer: number;
  jdaysCount: number;

  // outputs and output-specific parameters
  // ECI is enabled by default (no eciPositionEnabled flag)
  eciPositions: number;
  eciVelocities: number;
  sgp4Errors: number;

  // keeping flags together to save struct memory space
  gmstEnabled: boolean;
  ecfPositionEnabled: boolean;
  ecfVelocityEnabled: boolean;
  geodeticPositionEnabled: boolean;
  lookAnglesEnabled: boolean;
  dopplerFactorEnabled: boolean;

  gmstValues: number;

  ecfPositions: number;

  ecfVelocities: number;

  geodeticPositions: number;

  longitudeRadians: number;
  latitudeRadians: number;
  heightKm: number;
  lookAngles: number;

  observerEcfX: number;
  observerEcfY: number;
  observerEcfZ: number;
  dopplerFactors: number;

  sunPositionEnabled: boolean;
  sunPositions: number;

  shadowFractionEnabled: boolean;
  shadowFractionValues: number;
}

export function passRunDataToWasm(
  module: WasmModuleBase,
  runDataStruct: NativeStructLayout<keyof RunData>,
  runData: RunData,
): number {
  const runDataSize = module._get_rundata_size();
  const runDataPointer = module._calloc_one(runDataSize);
  const writer = new CppMemoryWriter(module.HEAP8.buffer, runDataPointer);
  Object.entries(runData).forEach(([fieldName, value]) => {
    const fieldLayout = runDataStruct.get(fieldName as keyof RunData);
    if (!fieldLayout) {
      throw new Error(`Field ${fieldName} not found in RunData struct layout. Please file an issue to satellite.js.`);
    }
    writer.writeValue(fieldName, fieldLayout.offset, fieldLayout.type, value, fieldLayout.size);
  });
  return runDataPointer;
}
