import type { MainModule } from '../../wasm-build/release/index.js';
import * as constants from '../constants.js';
import type { SatRec } from '../propagation/SatRec.js';
import { CppMemoryWriter } from './struct-read-write.js';

/**
 * A union of all types of field which can be present in `elsetrec` C++ struct
 */
type NativeFieldType = 'int' | 'long' | 'double' | 'char[]' | 'char' | 'unsigned char';

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

/**
 * Map of names of fields in C++ `elsetrec` struct, together with their types, offsets and sizes
 */
export type NativeStructLayout = Map<NativeField, { type: NativeFieldType; offset: number; size: number }>

export function getNativeStructFieldLayout(module: MainModule): NativeStructLayout {
  const layoutStringPointer = module._create_struct_layout_string_pointer();
  const structureJsonString = module.UTF8ToString(layoutStringPointer);
  module._free_offsets_string(layoutStringPointer);
  const structureJson = JSON.parse(structureJsonString) as [NativeField, NativeFieldType, number, number][];
  return new Map(structureJson.map(([field, type, offset, size]) => [field, { type, offset, size }]));
}

export function getNativeStructSize(module: MainModule): number {
  return module._get_elsetrec_size();
}

function writeValueToMemory(writer: CppMemoryWriter, fieldName: string, offset: number, type: NativeFieldType, value: unknown, size: number): void {
  switch (type) {
    case 'double':
      {
        if (typeof value !== 'number') {
          throw new Error(`Expected number for ${fieldName}, got ${typeof value}`);
        }
        writer.writeDouble(offset, value);
        break;
      }
    case 'int':
      {
        if (typeof value !== 'number') {
          throw new Error(`Expected number for ${fieldName}, got ${typeof value}`);
        }
        writer.writeInt(offset, value);
        break;
      }
    case 'char':
      {
        if (typeof value !== 'string') {
          throw new Error(`Expected char for ${fieldName}, got "${typeof value}"`);
        }
        writer.writeChar(offset, value);
        break;
      }
    case 'char[]':
      {
        if (typeof value !== 'string') {
          throw new Error(`Expected string for ${fieldName}, got "${typeof value}"`);
        }
        writer.writeString(offset, value, size);
        break;
      }
  }
}

export function allocateAndWriteNativeStructArrayFromSatrecArray(module: MainModule, satrecArray: SatRec[]): number {
  const layout = getNativeStructFieldLayout(module);
  const nativeSize = getNativeStructSize(module);
  const pointer = module._malloc(satrecArray.length * nativeSize);
  const writer = new CppMemoryWriter(module.HEAPU8.buffer);
  satrecArray.forEach((satrec, index) => {
    const offset = index * nativeSize;
    writer.setBaseOffset(pointer + offset);
    layout.forEach(({ type, offset, size }, field) => {
      if (Object.hasOwn(constants, field)) {
        writeValueToMemory(writer, field, offset, type, constants[field as keyof typeof constants], size)
      }
      if (field === 'no_unkozai') {
        writeValueToMemory(writer, field, offset, type, satrec.no, size);
      }
      if (field === 'radiusearthkm') {
        writeValueToMemory(writer, field, offset, type, constants.earthRadius, size)
      }
      if (!(field in satrec)) {
        return;
      }
      writeValueToMemory(writer, field, offset, type, satrec[field as keyof SatRec], size);
    });
  });
  return pointer;
}
