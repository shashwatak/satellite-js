export type TupleOf<T, N extends number> = N extends N
  ? number extends N
    ? readonly T[]
    : _TupleOf<T, N, []>
  : never;
// eslint-disable-next-line @typescript-eslint/naming-convention
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;
