import { describe, it, expect } from 'vitest';
import WasmModuleFactory from 'wasm-module/index.js';
import { getNativeStructSize, getNativeStructFieldLayout, NativeStructLayout, allocateNativeStructArrayFromSatrecArray } from '../../src/wasm-wrapping/native-struct.js';
import { CppMemoryReader } from '../../src/wasm-wrapping/struct-manipulation.js';
import { twoline2satrec } from '../../src/io.js';

const module = await WasmModuleFactory();

const knownGoodLayout = {
  "satnum": ["char[]", 0, 6],
  "epochyr": ["int", 8, 4],
  "epochtynumrev": ["int", 12, 4],
  "error": ["int", 16, 4],
  "operationmode": ["char", 20, 1],
  "init": ["char", 21, 1],
  "method": ["char", 22, 1],
  "isimp": ["int", 24, 4],
  "aycof": ["double", 32, 8],
  "con41": ["double", 40, 8],
  "cc1": ["double", 48, 8],
  "cc4": ["double", 56, 8],
  "cc5": ["double", 64, 8],
  "d2": ["double", 72, 8],
  "d3": ["double", 80, 8],
  "d4": ["double", 88, 8],
  "delmo": ["double", 96, 8],
  "eta": ["double", 104, 8],
  "argpdot": ["double", 112, 8],
  "omgcof": ["double", 120, 8],
  "sinmao": ["double", 128, 8],
  "t": ["double", 136, 8],
  "t2cof": ["double", 144, 8],
  "t3cof": ["double", 152, 8],
  "t4cof": ["double", 160, 8],
  "t5cof": ["double", 168, 8],
  "x1mth2": ["double", 176, 8],
  "x7thm1": ["double", 184, 8],
  "mdot": ["double", 192, 8],
  "nodedot": ["double", 200, 8],
  "xlcof": ["double", 208, 8],
  "xmcof": ["double", 216, 8],
  "nodecf": ["double", 224, 8],
  "irez": ["int", 232, 4],
  "d2201": ["double", 240, 8],
  "d2211": ["double", 248, 8],
  "d3210": ["double", 256, 8],
  "d3222": ["double", 264, 8],
  "d4410": ["double", 272, 8],
  "d4422": ["double", 280, 8],
  "d5220": ["double", 288, 8],
  "d5232": ["double", 296, 8],
  "d5421": ["double", 304, 8],
  "d5433": ["double", 312, 8],
  "dedt": ["double", 320, 8],
  "del1": ["double", 328, 8],
  "del2": ["double", 336, 8],
  "del3": ["double", 344, 8],
  "didt": ["double", 352, 8],
  "dmdt": ["double", 360, 8],
  "dnodt": ["double", 368, 8],
  "domdt": ["double", 376, 8],
  "e3": ["double", 384, 8],
  "ee2": ["double", 392, 8],
  "peo": ["double", 400, 8],
  "pgho": ["double", 408, 8],
  "pho": ["double", 416, 8],
  "pinco": ["double", 424, 8],
  "plo": ["double", 432, 8],
  "se2": ["double", 440, 8],
  "se3": ["double", 448, 8],
  "sgh2": ["double", 456, 8],
  "sgh3": ["double", 464, 8],
  "sgh4": ["double", 472, 8],
  "sh2": ["double", 480, 8],
  "sh3": ["double", 488, 8],
  "si2": ["double", 496, 8],
  "si3": ["double", 504, 8],
  "sl2": ["double", 512, 8],
  "sl3": ["double", 520, 8],
  "sl4": ["double", 528, 8],
  "gsto": ["double", 536, 8],
  "xfact": ["double", 544, 8],
  "xgh2": ["double", 552, 8],
  "xgh3": ["double", 560, 8],
  "xgh4": ["double", 568, 8],
  "xh2": ["double", 576, 8],
  "xh3": ["double", 584, 8],
  "xi2": ["double", 592, 8],
  "xi3": ["double", 600, 8],
  "xl2": ["double", 608, 8],
  "xl3": ["double", 616, 8],
  "xl4": ["double", 624, 8],
  "xlamo": ["double", 632, 8],
  "zmol": ["double", 640, 8],
  "zmos": ["double", 648, 8],
  "atime": ["double", 656, 8],
  "xli": ["double", 664, 8],
  "xni": ["double", 672, 8],
  "a": ["double", 680, 8],
  "altp": ["double", 688, 8],
  "alta": ["double", 696, 8],
  "epochdays": ["double", 704, 8],
  "jdsatepoch": ["double", 712, 8],
  "jdsatepochF": ["double", 720, 8],
  "nddot": ["double", 728, 8],
  "ndot": ["double", 736, 8],
  "bstar": ["double", 744, 8],
  "rcse": ["double", 752, 8],
  "inclo": ["double", 760, 8],
  "nodeo": ["double", 768, 8],
  "ecco": ["double", 776, 8],
  "argpo": ["double", 784, 8],
  "mo": ["double", 792, 8],
  "no_kozai": ["double", 800, 8],
  "classification": ["char", 808, 1],
  "intldesg": ["char[]", 809, 11],
  "ephtype": ["int", 820, 4],
  "elnum": ["long", 824, 4],
  "revnum": ["long", 828, 4],
  "no_unkozai": ["double", 832, 8],
  "am": ["double", 840, 8],
  "em": ["double", 848, 8],
  "im": ["double", 856, 8],
  "Om": ["double", 864, 8],
  "om": ["double", 872, 8],
  "mm": ["double", 880, 8],
  "nm": ["double", 888, 8],
  "tumin": ["double", 896, 8],
  "mus": ["double", 904, 8],
  "radiusearthkm": ["double", 912, 8],
  "xke": ["double", 920, 8],
  "j2": ["double", 928, 8],
  "j3": ["double", 936, 8],
  "j4": ["double", 944, 8],
  "j3oj2": ["double", 952, 8],
  "dia_mm": ["long", 960, 4],
  "period_sec": ["double", 968, 8],
  "active": ["unsigned char", 976, 1],
  "not_orbital": ["unsigned char", 977, 1],
  "rcs_m2": ["double", 984, 8]
}

function layoutToObject(layout: NativeStructLayout) {
  return Object.fromEntries(Array.from(layout.entries()).map(entry => [entry[0], [entry[1].type, entry[1].offset, entry[1].size]]))
}

describe('WASM elsetrec struct (debug only)', () => {
  it('has size exactly 992 bytes', async () => {
    expect(getNativeStructSize(module)).toBe(992);
  });

  it('layout string has no unknown changes', () => {
    const layout = getNativeStructFieldLayout(module);

    expect(layoutToObject(layout)).toEqual(knownGoodLayout);
  });

  it('has correct properties in case of writing directly to memory instead of parsing TLE', () => {
    const TLE1 = '1 25544U 98067A   20344.91782528  .00001264  00000-0  29621-4 0  9993';
    const TLE2 = '2 25544  51.6466  54.5795 0002012  70.2257  59.7266 15.49390871257157';

    const satrec = twoline2satrec(TLE1, TLE2);

    const pointer1 = module._malloc(module.lengthBytesUTF8(TLE1) + 1);
    module.stringToUTF8(TLE1, pointer1, module.lengthBytesUTF8(TLE1) + 1);
    const pointer2 = module._malloc(module.lengthBytesUTF8(TLE2) + 1);
    module.stringToUTF8(TLE2, pointer2, module.lengthBytesUTF8(TLE2) + 1);
    const size = module._get_elsetrec_size();
    const satrecInitializedFromTlePointer = module._malloc(size);
    module._init_satrec_from_tle(satrecInitializedFromTlePointer, pointer1, pointer2);
    module._free(pointer1);
    module._free(pointer2);

    const satrecInitializedFromJSSatrec = allocateNativeStructArrayFromSatrecArray(module, [satrec]);

    const readerOfInitializedFromTLE = new CppMemoryReader(module.HEAP8.buffer, satrecInitializedFromTlePointer);
    const readerOfInitializedFromJS = new CppMemoryReader(module.HEAP8.buffer, satrecInitializedFromJSSatrec);

    const layout = getNativeStructFieldLayout(module);
    layout.forEach(({ type, offset, size }, field) => {
      if (field === 'jdsatepoch') {
        const jdsatepochTlePart1 = readerOfInitializedFromTLE.readDouble(offset);
        const jsatepochPart2Field = layout.get('jdsatepochF');
        const jdsatepochTlePart2 = readerOfInitializedFromTLE.readDouble(jsatepochPart2Field!.offset);
        const jdsatepochJS = readerOfInitializedFromJS.readDouble(offset);
        expect(jdsatepochTlePart1 + jdsatepochTlePart2, field).toEqual(jdsatepochJS);
        return;
      }
      if (['jdsatepochF', 'classification', 'intldesg', 'elnum', 'revnum', 'am', 'em', 'im', 'om', 'Om', 'nm', 'mm', 'mus'].includes(field)) return;
      switch (type) {
        case 'int':
          expect(readerOfInitializedFromTLE.readInt(offset), field).toEqual(readerOfInitializedFromJS.readInt(offset));
          break;
        case 'long':
          expect(readerOfInitializedFromTLE.readLong(offset), field).toEqual(readerOfInitializedFromJS.readLong(offset));
          break;
        case 'double':
          expect(readerOfInitializedFromTLE.readDouble(offset), field).toEqual(readerOfInitializedFromJS.readDouble(offset));
          break;
        case 'char[]':
          expect(readerOfInitializedFromTLE.readString(offset, size), field).toEqual(readerOfInitializedFromJS.readString(offset, size));
          break;
        case 'char':
          expect(readerOfInitializedFromTLE.readChar(offset), field).toEqual(readerOfInitializedFromJS.readChar(offset));
          break;
        case 'unsigned char':
          expect(readerOfInitializedFromTLE.readUnsignedChar(offset), field).toEqual(readerOfInitializedFromJS.readUnsignedChar(offset));
          break;
      }
    })
  })
});
