export class CppMemoryWriter {
  constructor(buffer: ArrayBuffer, private baseOffset = 0) {
    this.view = new DataView(buffer);
  }

  private view: DataView;

  setBaseOffset(offset: number): void {
    this.baseOffset = offset;
  }

  writeInt(offset: number, value: number): void {
    this.view.setInt32(this.baseOffset + offset, value, true);
  }

  writeString(offset: number, value: string, lengthWithNullTerminator: number): void {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(value);
    const bytes = new Uint8Array(
      this.view.buffer,
      this.baseOffset + offset,
      lengthWithNullTerminator,
    );

    for (let i = 0; i < lengthWithNullTerminator - 1; i++) {
      bytes[i] = i < encoded.length ? encoded[i]! : 0;
    }
    bytes[lengthWithNullTerminator - 1] = 0; // null-terminate the string
  }

  writeDouble(offset: number, value: number): void {
    this.view.setFloat64(this.baseOffset + offset, value, true);
  }

  writeChar(offset: number, value: string): void {
    const charCode = value.charCodeAt(0) || 0;
    this.view.setInt8(this.baseOffset + offset, charCode);
  }
}
