import * as constants from '../constants.js';
import { SatRec } from '../propagation/SatRec.js';
import { getNativeStructFieldLayout } from './native-structs-from-js.js';
import { WasmModuleBase } from './runtimes/wasm-module-interfaces.js';
import { CppMemoryWriter } from './struct-write.js';

/**
 * A union of all current fields of `elsetrec` C++ struct
 */
type NativeField =
  | 'satnum'
  | 'epochyr' | 'epochtynumrev'
  | 'error'
  | 'operationmode'
  | 'init' | 'method'
  | 'isimp'
  | 'aycof' | 'con41' | 'cc1' | 'cc4' | 'cc5' | 'd2' | 'd3' | 'd4'
  | 'delmo' | 'eta' | 'argpdot' | 'omgcof' | 'sinmao' | 't' | 't2cof' | 't3cof'
  | 't4cof' | 't5cof' | 'x1mth2' | 'x7thm1' | 'mdot' | 'nodedot' | 'xlcof' | 'xmcof'
  | 'nodecf'
  | 'irez'
  | 'd2201' | 'd2211' | 'd3210' | 'd3222' | 'd4410' | 'd4422' | 'd5220' | 'd5232'
  | 'd5421' | 'd5433' | 'dedt' | 'del1' | 'del2' | 'del3' | 'didt' | 'dmdt'
  | 'dnodt' | 'domdt' | 'e3' | 'ee2' | 'peo' | 'pgho' | 'pho' | 'pinco'
  | 'plo' | 'se2' | 'se3' | 'sgh2' | 'sgh3' | 'sgh4' | 'sh2' | 'sh3'
  | 'si2' | 'si3' | 'sl2' | 'sl3' | 'sl4' | 'gsto' | 'xfact' | 'xgh2'
  | 'xgh3' | 'xgh4' | 'xh2' | 'xh3' | 'xi2' | 'xi3' | 'xl2' | 'xl3'
  | 'xl4' | 'xlamo' | 'zmol' | 'zmos' | 'atime' | 'xli' | 'xni'
  | 'a' | 'altp' | 'alta' | 'epochdays' | 'jdsatepoch' | 'jdsatepochF' | 'nddot' | 'ndot'
  | 'bstar' | 'rcse' | 'inclo' | 'nodeo' | 'ecco' | 'argpo' | 'mo' | 'no_kozai'
  | 'classification' | 'intldesg'
  | 'ephtype'
  | 'elnum' | 'revnum'
  | 'no_unkozai'
  | 'am' | 'em' | 'im' | 'Om' | 'om' | 'mm' | 'nm'
  | 'tumin' | 'mus' | 'radiusearthkm' | 'xke' | 'j2' | 'j3' | 'j4' | 'j3oj2'
  | 'dia_mm'
  | 'period_sec'
  | 'active'
  | 'not_orbital'
  | 'rcs_m2';

export function allocateNativeStructArray(
  module: WasmModuleBase,
  count: number,
): number {
  const nativeSize = module._get_elsetrec_size();
  return module._calloc_one(count * nativeSize);
}

export function writeNativeStructArrayFromSatrecArray(
  module: WasmModuleBase,
  pointer: number,
  satrecArray: SatRec[],
): void {
  const structLayoutStringPointer = module._create_elsetrec_struct_layout_string_pointer();
  const layout = getNativeStructFieldLayout<NativeField>(structLayoutStringPointer, module);
  module._free_struct_layout_string(structLayoutStringPointer);
  const nativeSize = module._get_elsetrec_size();
  const writer = new CppMemoryWriter(module.HEAP8.buffer);
  satrecArray.forEach((satrec, index) => {
    const currentOffset = index * nativeSize;
    writer.setBaseOffset(pointer + currentOffset);
    layout.forEach(({ type, offset, size }, field) => {
      if (Object.hasOwn(constants, field)) {
        writer.writeValue(
          field,
          offset,
          type,
          constants[field as keyof typeof constants],
          size,
        );
      }
      if (field === 'no_unkozai') {
        writer.writeValue(field, offset, type, satrec.no, size);
      }
      if (field === 'radiusearthkm') {
        writer.writeValue(field, offset, type, constants.earthRadius, size);
      }
      if (!(Object.hasOwn(satrec, field))) {
        return;
      }
      writer.writeValue(field, offset, type, satrec[field as keyof SatRec], size);
    });
  });
}
