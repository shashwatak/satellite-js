/**
 * Type-level tests for `BulkPropagator.run()` argument inference and output types.
 *
 * These are checked by `tsc`, not executed - the whole file is type-only, and the
 * `declare const` runtime means no WASM module is ever loaded.
 *
 * At some point this should move to vitest type-only tests when they are not experimental.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { EciVec3, Kilometer, LookAngles } from '../../src/common-types.js';
import type { SatRecError } from '../../src/propagation/SatRec.js';
import {
  BulkPropagator,
  DopplerFactorCalculator,
  EcfPositionCalculator,
  EcfVelocityCalculator,
  EciBaseCalculator,
  GmstCalculator,
  LookAnglesCalculator,
} from '../../src/wasm/index.js';
import type {
  MultiThreadRuntime,
  SingleThreadRuntime,
} from '../../src/wasm/runtimes/wasm-runtime.js';

declare const runtime: SingleThreadRuntime;
declare const multiThreadRuntime: MultiThreadRuntime;

declare const observerGeodetic: {
  latitude: number;
  longitude: number;
  height: number;
};
declare const observerEcf: EciVec3<Kilometer>;

describe('run() with only optional run parameters', () => {
  // EciBaseCalculator declares `communityDecayCheckEnabled?`, GmstCalculator
  // declares nothing at all.
  const propagator = new BulkPropagator({
    runtime,
    calculators: [new EciBaseCalculator(), new GmstCalculator()],
    satRecsCount: 1,
    datesCount: 1,
  });

  it('makes the argument itself optional', () => {
    propagator.run();
    propagator.run({});
  });

  it('accepts the key of a calculator whose parameters are all optional', () => {
    propagator.run({ eci: {} });
    propagator.run({ eci: { communityDecayCheckEnabled: true } });
  });

  it('rejects the key of a calculator that declares no parameters', () => {
    // @ts-expect-error - gmst declares no run parameters at all
    propagator.run({ gmst: {} });
  });

  it('rejects unknown keys and wrongly typed values', () => {
    // @ts-expect-error - unknown calculator key
    propagator.run({ typoKey: {} });
    // @ts-expect-error - unknown property inside eci
    propagator.run({ eci: { nope: true } });
    // @ts-expect-error - communityDecayCheckEnabled must be a boolean
    propagator.run({ eci: { communityDecayCheckEnabled: 'yes' } });
  });
});

describe('run() with a required run parameter', () => {
  // LookAnglesCalculator requires an observer; eci remains optional-only.
  const propagator = new BulkPropagator({
    runtime,
    calculators: [
      new EciBaseCalculator(),
      new GmstCalculator(),
      new EcfPositionCalculator(),
      new LookAnglesCalculator(),
    ],
    satRecsCount: 1,
    datesCount: 1,
  });

  it('requires the argument and the required key', () => {
    propagator.run({ lookAngles: { observer: observerGeodetic } });
    // @ts-expect-error - lookAngles is required, omitting the argument is an error
    propagator.run();
    // @ts-expect-error - lookAngles is required
    propagator.run({});
  });

  it('still allows, but does not force, the optional-only key', () => {
    propagator.run({
      lookAngles: { observer: observerGeodetic },
      eci: { communityDecayCheckEnabled: true },
    });
    // @ts-expect-error - lookAngles is still required when only eci is given
    propagator.run({ eci: {} });
  });

  it('rejects no-parameter and unknown keys alongside a required one', () => {
    propagator.run({
      lookAngles: { observer: observerGeodetic },
      // @ts-expect-error - gmst declares no run parameters
      gmst: {},
    });
    propagator.run({
      lookAngles: { observer: observerGeodetic },
      // @ts-expect-error - unknown calculator key
      typoKey: {},
    });
  });

  it('type checks the required value', () => {
    // @ts-expect-error - observer must be a GeodeticLocation, not a number
    propagator.run({ lookAngles: { observer: 5 } });
  });
});

describe('run() with no run parameters anywhere', () => {
  const propagator = new BulkPropagator({
    runtime,
    calculators: [new GmstCalculator()],
    satRecsCount: 1,
    datesCount: 1,
  });

  it('accepts no argument or an empty object, but no keys', () => {
    propagator.run();
    propagator.run({});
    // @ts-expect-error - gmst declares no run parameters
    propagator.run({ gmst: {} });
  });
});

describe('run() with several required run parameters', () => {
  const propagator = new BulkPropagator({
    runtime,
    calculators: [
      new EciBaseCalculator(),
      new GmstCalculator(),
      new EcfPositionCalculator(),
      new EcfVelocityCalculator(),
      new DopplerFactorCalculator(),
      new LookAnglesCalculator(),
    ],
    satRecsCount: 1,
    datesCount: 1,
  });

  it('requires every required key', () => {
    propagator.run({
      dopplerFactor: { observer: observerEcf },
      lookAngles: { observer: observerGeodetic },
    });
    // @ts-expect-error - dopplerFactor is missing
    propagator.run({ lookAngles: { observer: observerGeodetic } });
    // @ts-expect-error - lookAngles is missing
    propagator.run({ dopplerFactor: { observer: observerEcf } });
    // @ts-expect-error - both are missing
    propagator.run();
  });
});

describe('run() return type follows the runtime', () => {
  it('returns undefined for a single-thread runtime', () => {
    const propagator = new BulkPropagator({
      runtime,
      calculators: [new GmstCalculator()],
      satRecsCount: 1,
      datesCount: 1,
    });
    expectTypeOf(propagator.run()).toEqualTypeOf<undefined>();
  });

  it('returns a Promise for a multi-thread runtime', () => {
    const propagator = new BulkPropagator({
      runtime: multiThreadRuntime,
      calculators: [new GmstCalculator()],
      satRecsCount: 1,
      datesCount: 1,
    });
    expectTypeOf(propagator.run()).toEqualTypeOf<Promise<void>>();
  });
});

describe('output types are keyed by calculator name', () => {
  const propagator = new BulkPropagator({
    runtime,
    calculators: [
      new EciBaseCalculator(),
      new GmstCalculator(),
      new EcfPositionCalculator(),
      new LookAnglesCalculator(),
    ],
    satRecsCount: 1,
    datesCount: 1,
  });

  it('resolves formatted output per calculator', () => {
    const formatted = propagator.getFormattedOutput(0, 0);
    expectTypeOf(formatted).toExtend<
      { lookAngles: LookAngles; gmst: number } | undefined
    >();
    expectTypeOf(formatted!.eci.position).toEqualTypeOf<EciVec3<Kilometer>>();
    expectTypeOf(formatted!.eci.error).toEqualTypeOf<SatRecError>();
  });

  it('resolves raw output per calculator', () => {
    const raw = propagator.getRawOutput();
    expectTypeOf(raw.lookAngles).toEqualTypeOf<Float64Array>();
    expectTypeOf(raw.eci.position).toEqualTypeOf<Float64Array>();
    expectTypeOf(raw.eci.error).toEqualTypeOf<Int8Array>();
  });

  it('omits calculators that were not configured', () => {
    const formatted = propagator.getFormattedOutput(0, 0);
    // @ts-expect-error - ShadowFractionCalculator was not configured
    formatted!.shadowFraction;
  });
});
