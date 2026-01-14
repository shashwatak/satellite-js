import { NativeFieldType } from './native-field-type.js';

export class CppMemoryWriter {
  constructor(buffer: ArrayBufferLike, private baseOffset = 0) {
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

  writeBoolean(offset: number, value: boolean): void {
    this.view.setInt8(this.baseOffset + offset, value ? 1 : 0);
  }

  writeValue(
    fieldName: string,
    offset: number,
    type: NativeFieldType,
    value: unknown,
    size: number,
  ): void {
    switch (type) {
      case 'bool': {
        // todo test performance without these checks
        if (typeof value !== 'boolean') {
          throw new Error(`Expected boolean for ${fieldName}, got ${typeof value}`);
        }
        this.writeBoolean(offset, value);
        break;
      }
      case 'double':
      {
        if (typeof value !== 'number') {
          throw new Error(`Expected number for ${fieldName}, got ${typeof value}`);
        }
        this.writeDouble(offset, value);
        break;
      }
      case 'int':
      {
        if (typeof value !== 'number') {
          throw new Error(`Expected number for ${fieldName}, got ${typeof value}`);
        }
        this.writeInt(offset, value);
        break;
      }
      case 'char':
      {
        if (typeof value !== 'string') {
          throw new Error(`Expected char for ${fieldName}, got "${typeof value}"`);
        }
        this.writeChar(offset, value);
        break;
      }
      case 'char[]':
      {
        if (typeof value !== 'string') {
          throw new Error(`Expected string for ${fieldName}, got "${typeof value}"`);
        }
        this.writeString(offset, value, size);
        break;
      }
      default:
      {
        throw new Error(`Writing type ${type} not implemented (field ${fieldName})`);
      }
    }
  }
}
