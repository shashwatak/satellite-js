export class CppMemoryReader {
  constructor(buffer: ArrayBufferLike, public baseOffset = 0) {
    this.view = new DataView(buffer);
  }

  private view: DataView;

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
