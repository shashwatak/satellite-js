import type { SatRec } from '../propagation/SatRec.js';
import type { Calculator } from './calculators/calculator-interface.js';
import type { TupleOf } from './calculators/tuple-of.js';
import type { TypedArray } from './typed-array.js';
import { topologicalSort } from './toposort.js';
import { allocateAndWriteNativeStructArrayFromSatrecArray } from './elsetrec-struct.js';
import { allocateDatesArray, writeDatesArray } from './date-to-wasm.js';
import { RunData } from './run-data.js';
import { MultiThreadRuntime, WasmRuntime } from './runtimes/wasm-runtime.js';

export type CalculatorsToFormattedOutput<
  Calculators extends readonly Calculator<
    string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any
  >[]
> = {
  [K in Calculators[number]['name']]: ReturnType<Extract<Calculators[number], { name: K }>['getFormattedOutput']>;
};

export type CalculatorsToRawOutput<
  Calculators extends readonly Calculator<
    string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any
  >[]
> = {
  [K in Calculators[number]['name']]: ReturnType<Extract<Calculators[number], { name: K }>['getRawOutput']>;
};

type RunParametersOf<C> = C extends Calculator<any, any, any, any, any, infer RP> ? RP : never;

type IsEmptyRunParams<T> = {} extends T ? (T extends {} ? true : false) : false;

type CalculatorsToRunParameters<
  Calculators extends readonly Calculator<
    string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any
  >[]
> = {
  [C in Calculators[number] as C extends { name: infer Name extends string }
    ? (IsEmptyRunParams<RunParametersOf<C>> extends true ? never : Name)
    : never]: RunParametersOf<C>
};

type BulkPropagatorBaseRunArgs = { dates: readonly Date[] }

type BulkPropagatorBaseRunArgsWithCalculatorParams<
  Calculators extends readonly Calculator<
    string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, any, any
  >[]
> = BulkPropagatorBaseRunArgs & CalculatorsToRunParameters<Calculators>;

function ceilToMultipleOf64Bit(bytes: number): number {
  const bytesPer64Bit = 8;
  return Math.ceil(bytes / bytesPer64Bit) * bytesPer64Bit;
}

/**
 * This class allows faster propagation of multiple satellites and multiple time points
 * by batching calculations and leveraging WASM. It supports configurable set of calculators.
 *
 * Kitchen sink example to calculate Look Angles:
 * @example
 * ```typescript
 * import {
 *   createWasmModule,
 *   BulkPropagator,
 *   EciBaseCalculator, EcfPositionCalculator, GmstCalculator, LookAnglesCalculator
 * } from 'satellite.js';
 *
 * const wasmModule = await createWasmModule();
 * const satellites = [twoline2satrec(line1, line2)];
 * const dates = [new Date()];
 * const observerGeodetic = {
 *   latitude: degreesToRadians(41),
 *   longitude: degreesToRadians(-71),
 *   height: 0.2,
 * };
 *
 * // Important: either use `using` syntax OR call `propagator.dispose()` in the end, otherwise
 * // your app WILL LEAK MEMORY. Propagator disposal is your responsibility!
 * using propagator = new BulkPropagator({
 *   wasmModule,
 *   calculators: [
 *     new EciBaseCalculator(), // SGP4 output on which further calculators depend
 *     new GmstCalculator(), // dependency of EcfPosition
 *     new EcfPositionCalculator(), // depends on EciBase and Gmst; dependency of LookAngles
 *     // depends on EcfPosition; requires observer parameter in propagator.run()
 *     new LookAnglesCalculator(),
 *   ],
 *   satRecs: satellites, // satellites are fixed for the propagator lifetime
 *   datesCount: dates.length // dates length is fixed for the propagator lifetime
 * });
 *
 * propagator.run({ dates, lookAngles: { observer: observerGeodetic } });
 *
 * // Get formatted output for satellite 0 at date 0
 * const result = propagator.getFormattedOutput(0, 0);
 * console.log(result?.lookAngles.azimuth); // radians
 * console.log(result?.lookAngles.elevation); // radians
 *
 * // Get raw output in form of TypedArrays for further processing.
 * // Results are sorted by satellite order and then by date order:
 * // [satellite 0 date 0, satellite 0 date 1, ..., satellite 1 date 0, satellite 1 date 1, ...]
 * const rawResult = propagator.getRawOutput();
 * rawResult.lookAngles; // Float64Array
 * const [azimuth, elevation, rangeSat] = rawResult.lookAngles;
 *
 * // The approach above is the same as pure javascript below,
 * // but BulkPropagator is much more performant.
 * const results = [];
 * for (const satellite of satellites) {
 *   for (const date of dates) {
 *     const result = propagate(satellite, date);
 *     const ecf = eciToEcf(result!.position, gstime(date));
 *     const { azimuth, elevation, rangeSat } = ecfToLookAngles(observerGeodetic, ecf);
 *   }
 * }
 * ```
 *
 * @template Calculators - Readonly array of Calculator instances
 */
export class BulkPropagator<
  const Calculators extends readonly Calculator<
    string, number, TupleOf<string, number>, TypedArray | Record<string, TypedArray>, unknown
  >[],
  Runtime extends WasmRuntime,
> implements Disposable {
  private readonly calculators: Calculators;

  private readonly satrecsPointer: number;

  private readonly satrecsCount: number;

  private readonly datesPointer: number;

  private readonly datesCount: number;

  private readonly runtime: Runtime;

  private readonly outputPointer: number;

  private readonly outputPointersByCalculator: Map<Calculators[number]['name'], number>;

  private readonly calculatorDependenciesOutputsPointers: Map<Calculators[number]['name'], number[]>;

  private isDisposed: boolean = false;

  /**
   * Creates a BulkPropagator instance.
   * The BulkPropagator is generic depending on the Calculator instances passed to it.
   * The return types of `getFormattedOutput()`, `getRawOutput()`, and argument type of `run()`
   * depend on the passed Calculators.
   *
   * @param options - Configuration options
   * @param options.wasmModule - The WebAssembly module instance
   * (use `createWasmModule()` to create one and reuse it)
   * @param options.calculators - Array of calculator instances
   * to run during propagation; they all named as `*Calculator` for easy discovery
   * @param options.satRecs - Readonly array of SatRec objects
   * @param options.datesCount - Number of dates that will be propagated
   *
   * @example
   * ```ts
   * const propagator = new BulkPropagator({
   *   wasmModule: await createWasmModule(),
   *   calculators: [new EciPositionCalculator()],
   *   satRecs: [satrec1, satrec2],
   *   datesCount: 60, // Will be called to propagate 60 timestamps
   * });
   * ```
   *
   * @throws If calculator dependencies cannot be resolved.
   * Consult specific calculator type documentation and supply the dependencies.
   */
  constructor({
    runtime,
    calculators,
    satRecs,
    datesCount,
  }: {
    runtime: Runtime;
    calculators: Calculators;
    satRecs: SatRec[];
    datesCount: number;
  }) {
    this.runtime = runtime;
    if (Symbol.dispose) {
      this[Symbol.dispose] = () => this.dispose();
    }

    this.satrecsPointer = allocateAndWriteNativeStructArrayFromSatrecArray(runtime.module, satRecs);
    this.satrecsCount = satRecs.length;
    this.datesPointer = allocateDatesArray(runtime.module, datesCount);
    this.datesCount = datesCount;

    const sorted = topologicalSort(
      calculators.map((calculator) => ({
        provides: calculator.name,
        hasDependencies: calculator.dependencies,
      })),
    );
    this.calculators = sorted.map((name) => {
      const calculator = calculators.find((calc) => calc.name === name);
      return calculator;
    }) as unknown as Calculators;

    const outputOffsetsByCalculator = new Map();
    let offsetBytes = 0;
    for (const calculator of this.calculators) {
      const sizeBytes = ceilToMultipleOf64Bit(
        calculator.getOutputBufferSize(satRecs.length, datesCount),
      );
      outputOffsetsByCalculator.set(calculator.name, offsetBytes);
      offsetBytes += sizeBytes;
    }
    // offsetBytes is total size at this point
    this.outputPointer = runtime.module._malloc(offsetBytes);
    this.outputPointersByCalculator = new Map(
      Array.from(outputOffsetsByCalculator)
        .map(([name, offset]) => [name, this.outputPointer + offset]),
    );
    this.calculatorDependenciesOutputsPointers = new Map();
    for (const calculator of this.calculators) {
      const dependenciesPointers = calculator.dependencies.map(
        (dependency) => this.outputPointersByCalculator.get(dependency)!,
      );
      this.calculatorDependenciesOutputsPointers.set(calculator.name, dependenciesPointers);

      calculator.init(
        runtime.module,
        this.outputPointersByCalculator.get(calculator.name)!,
        satRecs.length,
        datesCount,
      );
    }
  }

  /**
   * Executes the bulk propagation for all satellites across all specified dates.
   * Overwrites previous results since allocalted memory is reused. Returns
   * void on calculation completion for single-threaded runtime, or a Promise
   * for multi-threaded runtime.
   *
   * @param args - Run arguments including dates and calculator-specific parameters
   * @param args.dates - Array of Date objects to propagate satellites for
   * (length must match datesCount from constructor)
   * @param args[calculatorName] - Some calculators require additional parameters
   * (example: `LookAnglesCalculator` requires observer position).
   *
   * @example
   * ```typescript
   * // Basic run with just dates
   * propagator.run({
   *   dates: [new Date(), new Date(Date.now() + 3600000)]
   * });
   *
   * // Run with calculator parameters
   * propagator.run({
   *   dates: dateArray,
   *   lookAngles: { observer: {
   *     latitude: degreesToRadians(41),
   *     longitude: degreesToRadians(-71),
   *     height: 0.2,
   *   } },
   * });
   * ```
   *
   * @throws If dates array length doesn't match the datesCount from constructor
   * @throws If the instance is disposed
   */
  run(
    args: BulkPropagatorBaseRunArgsWithCalculatorParams<Calculators>,
  ): Runtime extends MultiThreadRuntime ? Promise<void> : void {
    this.checkIfDisposed();
    if (args.dates.length !== this.datesCount) {
      throw new Error('length of `dates` must be the same as the `datesCount` passed to the BulkPropagator constructor');
    }
    writeDatesArray(this.runtime.module, this.datesPointer, args.dates);

    const runDataItems = this.calculators.map(
      (calculator) => {
        const runParams = (
          args as Record<string, RunParametersOf<Calculators>> & BulkPropagatorBaseRunArgs
        )[calculator.name];
        return calculator.getExecutionDescriptor(runParams!);
      },
    );

    const runData = Object.assign({
      satellitesPointer: this.satrecsPointer,
      satellitesCount: this.satrecsCount,
      jdaysPointer: this.datesPointer,
      jdaysCount: this.datesCount,
    } satisfies Partial<RunData>, ...runDataItems);

    return this.runtime.compute(runData) as Runtime extends MultiThreadRuntime
      ? Promise<void> : void;
  }

  /**
   * Retrieves formatted output for a specific satellite at a specific time index.
   *
   * @param satelliteIndex - Zero-based index of the satellite (0 to `satRecs.length` - 1)
   * @param dateIndex - Zero-based index of the date (0 to `dates.length` - 1)
   * @returns Formatted output object with results from all calculators,
   * or `undefined` if indices are out of bounds
   *
   * @example
   * ```typescript
   * // Get results for first satellite at second time point
   * const result = propagator.getFormattedOutput(0, 1);
   * if (result && result.eci.error === SatRecError.None) {
   *   const { x, y, z } = result.eci.position;
   * }
   *
   * // Iterate through all results
   * for (let satIdx = 0; satIdx < satellites.length; satIdx++) {
   *   for (let dateIdx = 0; dateIdx < dates.length; dateIdx++) {
   *     const result = propagator.getFormattedOutput(satIdx, dateIdx)!;
   *     // process results
   *   }
   * }
   * ```
   *
   * @throws If the instance is disposed
   */
  getFormattedOutput(
    satelliteIndex: number,
    dateIndex: number,
  ): CalculatorsToFormattedOutput<Calculators> | undefined {
    this.checkIfDisposed();
    if (satelliteIndex >= this.satrecsCount || dateIndex >= this.datesCount) {
      return undefined;
    }
    const result: Record<string, unknown> = {};
    for (const calculator of this.calculators) {
      const output = calculator.getFormattedOutput(satelliteIndex, dateIndex);
      result[calculator.name] = output;
    }
    return result as CalculatorsToFormattedOutput<Calculators>;
  }

  /**
   * Retrieves raw output arrays from all calculators. Can be used for further processing.
   * Bypasses all formatting so should be faster for refinement of all data.
   *
   * Raw outputs are typically TypedArrays (Float64Array, etc.) containing all results
   * in a flattened format. The arrays are views on WebAssembly memory; BulkPropagator overwrites
   * them during every run.
   *
   * @returns Object containing raw output arrays from each calculator.
   * Each property is named after the calculator.
   * Each array contains results for all satellites and all dates, sorted first by satellite index,
   * then by date index:
   * [satellite 0 date 0, satellite 0 date 1, ... satellite 1 date 0, satellite 1 date 1, ...].
   *
   * @example
   * ```typescript
   * const rawOutput = propagator.getRawOutput();
   *
   * const positions = rawOutput.eci.position; // Float64Array
   *
   * // Manual indexing: `positions[satIndex * datesCount * 3 + dateIndex * 3 + component]`
   * const satIndex = 0, dateIndex = 1;
   * const x = positions[satIndex * dates.length * 3 + dateIndex * 3 + 0];
   * const y = positions[satIndex * dates.length * 3 + dateIndex * 3 + 1];
   * const z = positions[satIndex * dates.length * 3 + dateIndex * 3 + 2];
   * ```
   *
   * @throws If the instance is disposed
   */
  getRawOutput(): CalculatorsToRawOutput<Calculators> {
    this.checkIfDisposed();
    const result: Record<string, unknown> = {};
    for (const calculator of this.calculators) {
      const output = calculator.getRawOutput();
      result[calculator.name] = output;
    }
    return result as CalculatorsToRawOutput<Calculators>;
  }

  private checkIfDisposed() {
    if (this.isDisposed) {
      throw new Error('This BulkPropagator instance is disposed and its memory freed; construct a new one, or check `using` scope or `dispose()` call');
    }
  }

  /**
   * Releases all allocated WebAssembly memory.
   *
   * This method is automatically called when using the `using` declaration
   * (if Symbol.dispose is supported).
   * Manual disposal is required when not using automatic resource management.
   *
   * @example
   * ```typescript
   * // Automatic disposal with 'using' (recommended)
   * using propagator = new BulkPropagator({...});
   * // disposal happens automatically at the end of the scope
   *
   * // Manual disposal
   * const propagator = new BulkPropagator({...});
   * propagator.dispose(); // must be called otherwise memory WILL LEAK
   * ```
   *
   * @throws If the instance is disposed already
   */
  dispose(): void {
    this.checkIfDisposed();
    this.runtime.module._free(this.satrecsPointer);
    this.runtime.module._free(this.outputPointer);
    this.runtime.module._free(this.datesPointer);
    this.isDisposed = true;
  }

  [Symbol.dispose]!: () => void;
}
