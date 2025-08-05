export class CppMemoryReader {
  constructor(buffer: ArrayBuffer, private baseOffset = 0) {
    this.view = new DataView(buffer);
  }

  private view: DataView;

  setBaseOffset(offset: number): void {
    this.baseOffset = offset;
  }

  readInt(offset: number): number {
    const value = this.view.getInt32(this.baseOffset + offset, true);
    return value;
  }

  readLong(offset: number): number {
    // Assuming 'long' is 32-bit in this context
    return this.readInt(offset);
  }

  readString(offset: number, length: number): string {
    const bytes = new Uint8Array(this.view.buffer, this.baseOffset + offset, length);
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  }

  readDouble(offset: number): number {
    const value = this.view.getFloat64(this.baseOffset + offset, true);
    return value;
  }

  readUnsignedChar(offset: number): number {
    const value = this.view.getUint8(this.baseOffset + offset);
    return value;
  }

  readChar(offset: number): string {
    const value = this.view.getInt8(this.baseOffset + offset);
    return String.fromCharCode(value);
  }
}

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

  writeLong(offset: number, value: number): void {
    // Assuming 'long' is 32-bit in this context
    this.writeInt(offset, value);
  }

  writeString(offset: number, value: string, lengthWithNullTerminator: number): void {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(value);
    const bytes = new Uint8Array(this.view.buffer, this.baseOffset + offset, lengthWithNullTerminator);

    for (let i = 0; i < lengthWithNullTerminator - 1; i++) {
      bytes[i] = i < encoded.length ? encoded[i]! : 0;
    }
    bytes[lengthWithNullTerminator - 1] = 0; // null-terminate the string
  }

  writeDouble(offset: number, value: number): void {
    this.view.setFloat64(this.baseOffset + offset, value, true);
  }

  writeUnsignedChar(offset: number, value: number): void {
    this.view.setUint8(this.baseOffset + offset, value);
  }

  writeChar(offset: number, value: string): void {
    const charCode = value.charCodeAt(0) || 0;
    this.view.setInt8(this.baseOffset + offset, charCode);
  }
}
