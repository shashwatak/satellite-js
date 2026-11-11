import { beforeAll, describe, expect, it } from 'vitest';
import {
  gstime,
  invjday,
  jday,
  propagate,
  twoline2satrec,
} from '../src/index.js';
import { compareVectors } from './compareVectors.js';

describe('Julian date / time', () => {
  let now: Date;
  beforeAll(() => {
    now = new Date();
  });

  describe('jday & invjday', () => {
    it('gives the same result with different arguments describing the same time', () => {
      expect(jday(now)).toEqual(
        jday(
          now.getUTCFullYear(),
          now.getUTCMonth() + 1,
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds(),
          now.getUTCMilliseconds(),
        ),
      );
    });

    it('outputs different results when milliseconds are passed', () => {
      const date = new Date('2018-01-01T05:30:30.123Z');

      const jdayNoMs = jday(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
      );

      const jdayMs = jday(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds(),
      );

      expect(jdayNoMs).not.toEqual(jdayMs);
    });

    it('outputs different results with millisecond precision', () => {
      const jday1 = jday(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        (now.getUTCMilliseconds() + 1) % 1000,
      );

      const jday2 = jday(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      );

      expect(jday1).not.toEqual(jday2);
    });

    it('invjday gives the same result as date and array', () => {
      const jd = jday(now);
      const date = invjday(jd);
      const dateArray = invjday(jd, true);
      expect(date.getUTCFullYear()).toEqual(dateArray[0]);
      expect(date.getUTCMonth() + 1).toEqual(dateArray[1]);
      expect(date.getUTCDate()).toEqual(dateArray[2]);
      expect(date.getUTCHours()).toEqual(dateArray[3]);
      expect(date.getUTCMinutes()).toEqual(dateArray[4]);
      expect(date.getUTCSeconds()).toEqual(dateArray[5]);
    });

    it('date to jday and inverse conversion', () => {
      const jd = jday(now);
      expect((invjday(jd) as Date).getTime()).toEqual(now.getTime());
    });
  });

  describe('jday & invjday round trip', () => {
    const roundTrip = (date: Date) =>
      (invjday(jday(date)) as Date).getTime() - date.getTime();

    const sweep = (from: number, step: number, count: number) => {
      const failures: string[] = [];
      for (let i = 0; i < count; i += 1) {
        const date = new Date(from + i * step);
        const delta = roundTrip(date);
        if (delta !== 0)
          failures.push(`${date.toISOString()} off by ${delta} ms`);
      }
      return failures.slice(0, 5);
    };

    // A julian date near 2.45e6 resolves only ~40 us, so the recovered second
    // lands just under the true integer about half the time. These three sweeps
    // are the inputs that used to lose a whole second to Math.floor.
    it('round trips instants falling exactly on a second', () => {
      expect(sweep(Date.UTC(2000, 0, 1), 61_000, 20_000)).toEqual([]);
    });

    it('round trips instants falling exactly on a minute', () => {
      expect(sweep(Date.UTC(2015, 5, 15), 60_000, 20_000)).toEqual([]);
    });

    it('round trips midnight', () => {
      expect(sweep(Date.UTC(1990, 0, 1), 86_400_000, 20_000)).toEqual([]);
    });

    it('round trips month, year and leap-day boundaries', () => {
      const failures: string[] = [];
      for (const year of [1958, 1972, 1999, 2000, 2001, 2004, 2024, 2100]) {
        for (let month = 0; month < 12; month += 1) {
          const first = Date.UTC(year, month, 1);
          for (const t of [first - 1000, first, first + 1000]) {
            const delta = roundTrip(new Date(t));
            if (delta !== 0)
              failures.push(`${new Date(t).toISOString()} off by ${delta} ms`);
          }
        }
      }
      expect(failures).toEqual([]);
    });

    it('keeps milliseconds', () => {
      for (const iso of [
        '2018-01-01T05:30:30.123Z',
        '2000-01-01T00:00:00.001Z',
        '2024-02-29T23:59:59.999Z',
        '1969-07-20T20:17:40.500Z',
      ]) {
        const date = new Date(iso);
        expect((invjday(jday(date)) as Date).toISOString()).toEqual(iso);
      }
    });

    it('array overload stays within the documented second range', () => {
      // Math.floor(sec - 8.64e-7) returned -1 whenever the residual went
      // slightly negative, which is outside the documented 0..59.999 range.
      const outOfRange: number[][] = [];
      for (let i = 0; i < 20_000; i += 1) {
        const parts = invjday(
          jday(new Date(Date.UTC(2000, 0, 8) + i * 60_000)),
          true,
        );
        if (parts[5] < 0 || parts[5] > 59) outOfRange.push([...parts]);
      }
      expect(outOfRange.slice(0, 5)).toEqual([]);
    });

    it('array overload agrees with the date overload', () => {
      const disagreements: string[] = [];
      for (let i = 0; i < 20_000; i += 1) {
        const jd = jday(new Date(Date.UTC(2000, 0, 1) + i * 60_000));
        const date = invjday(jd);
        const parts = invjday(jd, true);
        const asDate = [
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
        ];
        if (asDate.join() !== parts.join())
          disagreements.push(`${asDate.join()} vs ${parts.join()}`);
      }
      expect(disagreements.slice(0, 5)).toEqual([]);
    });
  });

  it('gstime gives the same result with different arguments describing the same time', () => {
    expect(gstime(now)).toEqual(
      gstime(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );
  });

  it('propagation gives the same result with different arguments describing the same time', () => {
    const date = new Date(2016, 7, 22);
    const tleLine1 =
      '1 27424U 02022A   16235.86686911  .00000105  00000-0  33296-4 0  9990';
    const tleLine2 =
      '2 27424  98.2022 175.3843 0001285  39.9183  23.2024 14.57119903760831';
    const satrec = twoline2satrec(tleLine1, tleLine2);

    const propagationByDate = propagate(satrec, date);
    const propagationByDateItems = propagate(
      satrec,
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    );

    expect(propagationByDate).not.toBeNull();
    expect(propagationByDateItems).not.toBeNull();

    // biome-ignore-start lint/style/noNonNullAssertion: asserted above
    compareVectors(
      propagationByDate!.position,
      propagationByDateItems!.position,
    );
    compareVectors(
      propagationByDate!.velocity,
      propagationByDateItems!.velocity,
    );
    // biome-ignore-end lint/style/noNonNullAssertion: asserted above
  });
});
