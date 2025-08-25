// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
    function UTF8ToString(ptr: number, maxBytesToRead?: number | undefined): string;
    function stringToUTF8(str: any, outPtr: any, maxBytesToWrite: any): any;
    function lengthBytesUTF8(str: any): number;
    let HEAPF32: any;
    let HEAPF64: any;
    let HEAP_DATA_VIEW: any;
    let HEAP8: any;
    let HEAPU8: any;
    let HEAP16: any;
    let HEAPU16: any;
    let HEAP32: any;
    let HEAPU32: any;
    let HEAP64: any;
    let HEAPU64: any;
}
interface WasmModule {
  _get_elsetrec_size(): number;
  _print_char_signedness(): void;
  _create_struct_layout_string_pointer(): number;
  _free_offsets_string(_0: number): void;
  _satrec_from_tle(_0: number, _1: number): number;
  _init_satrec_from_tle(_0: number, _1: number, _2: number): void;
  _free_satrec(_0: number): void;
  _propagate(_0: number, _1: number, _2: number, _3: number): void;
  _sgp4forJs(_0: number, _1: number, _2: number, _3: number, _4: number): void;
  _calculate_eci_base(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): void;
  _calculate_gmst(_0: number, _1: number, _2: number): void;
  _calculate_ecf_position_or_velocity(_0: number, _1: number, _2: number, _3: number, _4: number): void;
  _calculate_geodetic_positions(_0: number, _1: number, _2: number, _3: number, _4: number): void;
  _calculate_look_angles(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): void;
  _calculate_doppler_factor(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number): void;
  _malloc(_0: number): number;
  _free(_0: number): void;
}

export type MainModule = WasmModule & typeof RuntimeExports;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
